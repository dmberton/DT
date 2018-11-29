import { Component, ViewChild } from '@angular/core';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('commandFile') commandFile;
  arrTextLines: string[];
  errorMessage: string;
  drawing: string;
  canvas: string[][];
  canvasHeight: number;
  canvasWidth: number;

  canvasRegex = /^C\s[0-9]+\s[0-9]+$/;
  lineRegex = /^L\s[0-9]+\s[0-9]+\s[0-9]+\s[0-9]+$/;
  rectangleRegex = /^R\s[0-9]+\s[0-9]+\s[0-9]+\s[0-9]+$/;
  bucketFillRegex = /^B\s[0-9]+\s[0-9]+\s[a-z]$/;

  commandErrorMsg = {
    C: 'Invalid Canvas Command. Usage: C w h',
    L: 'Invalid Line Command. Usage: L x1 y1 x2 y2',
    R: 'Invalid Rectangle Command. Usage: R x1 y1 x2 y2',
    B: 'Invalid BucketFill Command. Usage: B x y c'
  };

  constructor() {
    this.drawing = '';
    this.canvasHeight = 0;
    this.canvasWidth = 0;
  }

  fGenerate() {
    this.errorMessage = '';
    const inputFile = this.commandFile.nativeElement.files[0];
    if (inputFile) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this._fProcessFile(fileReader.result, true);
      };
      fileReader.readAsText(inputFile);
    }
  }

  private _fProcessFile(content, bDownload?) {
    if (this._fValidate(content)) {
      this.arrTextLines.forEach(cmd => {
        if ('C' === cmd.charAt(0)) {
          this._fDrawCanvas(cmd);
        } else if ('L' === cmd.charAt(0)) {
          this._fDrawLine(cmd);
        } else if ('R' === cmd.charAt(0)) {
          this._fDrawRectangle(cmd);
        } else if ('B' === cmd.charAt(0)) {
          this._fDrawBucketFill(cmd);
        }
      });
      if (bDownload) {
        // This flag is for disable the download action during testing as it breaks karma.
        const output = new Blob([this.drawing], {
          type: 'text/plain;charset=utf-8'
        });
        saveAs(output, 'output.txt');
      }
    }
  }

  private _fValidate(content): boolean {
    let bValid = true;
    if (content) {
      this.arrTextLines = content.split(/\r|\n/);
      this.arrTextLines.forEach((cmd, lineNumber) => {
        if (lineNumber === 0 && !this.canvasRegex.test(cmd)) {
          this.errorMessage =
            'Line 1 - Please create a Valid Canvas first. Usage: C w h (w: width, h:height)';
          bValid = false;
        } else if (!/L|R|B|C/.test(cmd.charAt(0))) {
          this.errorMessage =
            'Line ' + (lineNumber + 1) + ' - Unknown Command.';
          bValid = false;
        } else if (cmd.startsWith('L') && !this.lineRegex.test(cmd)) {
          this._fBuildError(lineNumber, 'L');
          bValid = false;
        } else if (cmd.startsWith('R') && !this.rectangleRegex.test(cmd)) {
          this._fBuildError(lineNumber, 'R');
          bValid = false;
        } else if (cmd.startsWith('B') && !this.bucketFillRegex.test(cmd)) {
          this._fBuildError(lineNumber, 'B');
          bValid = false;
        } else if (cmd.startsWith('C') && !this.canvasRegex.test(cmd)) {
          this._fBuildError(lineNumber, 'C');
          bValid = false;
        }
      });
    } else {
      this.errorMessage = 'File is empty.';
      bValid = false;
    }
    return bValid;
  }

  private _fBuildError(lineNumber, messageKey) {
    this.errorMessage =
      'Line ' + (lineNumber + 1) + ' - ' + this.commandErrorMsg[messageKey];
  }

  private _fDrawCanvas(cmd) {
    this.drawing = '';
    const params = cmd.split(/\s/);
    const w = parseInt(params[1], 10);
    const h = parseInt(params[2], 10);
    if (w === 0 || h === 0) {
      this.errorMessage = 'Canvas must have dimensions > 0';
      return;
    }
    this.canvasHeight = h;
    this.canvasWidth = w;
    this.canvas = Array.from(Array(h), () => new Array(w));
    this._fCanvasToString();
  }

  private _fDrawLine(cmd) {
    if (this.canvas) {
      const params = cmd.split(/\s/);
      const x1 = this._fBoundCoord(parseInt(params[1], 10), 'X');
      const y1 = this._fBoundCoord(parseInt(params[2], 10), 'Y');
      const x2 = this._fBoundCoord(parseInt(params[3], 10), 'X');
      const y2 = this._fBoundCoord(parseInt(params[4], 10), 'Y');
      // Horizontal
      if (y1 === y2) {
        for (let i = x1 - 1; i < x2; i++) {
          this.canvas[y1 - 1][i] = 'X';
        }
        // Vertical
      } else if (x1 === x2) {
        for (let i = y1 - 1; i < y2; i++) {
          this.canvas[i][x1 - 1] = 'X';
        }
      } else {
        this.errorMessage = 'Only Horizontal or Vertical lines are supported.';
      }
      this._fCanvasToString();
    }
  }

  private _fDrawRectangle(cmd) {
    if (this.canvas) {
      const params = cmd.split(/\s/);
      const x1 = this._fBoundCoord(parseInt(params[1], 10), 'X');
      const y1 = this._fBoundCoord(parseInt(params[2], 10), 'Y');
      const x2 = this._fBoundCoord(parseInt(params[3], 10), 'X');
      const y2 = this._fBoundCoord(parseInt(params[4], 10), 'Y');

      for (let i = x1 - 1; i < x2; i++) {
        this.canvas[y1 - 1][i] = 'X';
        this.canvas[y2 - 1][i] = 'X';
      }
      for (let i = y1 - 1; i < y2; i++) {
        this.canvas[i][x1 - 1] = 'X';
        this.canvas[i][x2 - 1] = 'X';
      }
      this._fCanvasToString();
    }
  }

  private _fDrawBucketFill(cmd) {
    if (this.canvas) {
      const params = cmd.split(/\s/);
      const x = this._fBoundCoord(parseInt(params[1], 10), 'X');
      const y = this._fBoundCoord(parseInt(params[2], 10), 'Y');
      const c = params[3];

      this._fFloodFill(this.canvas, x - 1, y - 1, c);
      this._fCanvasToString();
    }
  }

  private _fFloodFill(canvas, x, y, c) {
    // Credit: http://inventwithpython.com/blogstatic/floodfill/recursivefloodfill.py
    if (canvas[y][x] !== undefined) {
      return;
    }
    canvas[y][x] = c;
    if (x > 0) {
      // Left
      this._fFloodFill(canvas, x - 1, y, c);
    }
    if (y > 0) {
      // Up
      this._fFloodFill(canvas, x, y - 1, c);
    }
    if (x < this.canvasWidth - 1) {
      // Right
      this._fFloodFill(canvas, x + 1, y, c);
    }
    if (y < this.canvasHeight - 1) {
      // Down
      this._fFloodFill(canvas, x, y + 1, c);
    }
  }

  private _fCanvasToString() {
    const h = this.canvasHeight;
    const w = this.canvasWidth;
    for (let i = -1; i < h + 1; i++) {
      this.drawing += i === -1 || i === h ? '+' : '|';
      for (let j = 0; j < w + 0; j++) {
        if (i < 0 || i === h) {
          this.drawing += '-';
        } else {
          this.drawing += this.canvas[i][j - 0] || ' ';
        }
      }
      this.drawing += i === -1 || i === h ? '+\n' : '|\n';
    }
  }

  private _fBoundCoord(coord, axis) {
    if (coord < 0) {
      return 0;
    } else if ('X' === axis && coord > this.canvasWidth) {
      return this.canvasWidth;
    } else if ('Y' === axis && coord > this.canvasHeight) {
      return this.canvasHeight;
    } else {
      return coord;
    }
  }
}
