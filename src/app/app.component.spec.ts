import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it('should render Drawing Tool in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Drawing Tool');
  }));
  it('should have error message: Line 4 - Invalid Canvas Command. Usage: C w h', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app._fBuildError(3, 'C');
    expect(app.errorMessage).toEqual(
      'Line 4 - Invalid Canvas Command. Usage: C w h'
    );
  }));
  it('should have error message: Line 6 - Invalid Line Command. Usage: L x1 y1 x2 y2', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app._fBuildError(5, 'L');
    expect(app.errorMessage).toEqual(
      'Line 6 - Invalid Line Command. Usage: L x1 y1 x2 y2'
    );
  }));
  it('should have error message: Line 11 - Invalid Rectangle Command. Usage: R x1 y1 x2 y2', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app._fBuildError(10, 'R');
    expect(app.errorMessage).toEqual(
      'Line 11 - Invalid Rectangle Command. Usage: R x1 y1 x2 y2'
    );
  }));
  it('should have error message: Line 1 - Invalid BucketFill Command. Usage: B x y c', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app._fBuildError(0, 'B');
    expect(app.errorMessage).toEqual(
      'Line 1 - Invalid BucketFill Command. Usage: B x y c'
    );
  }));
  it('should fail, Create Canvas first', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'L 1 2 6 2';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(
      'Line 1 - Please create a Valid Canvas first. Usage: C w h (w: width, h:height)'
    );
  }));
  it('should pass, Create Canvas first', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 3 4';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(undefined);
    expect(app.canvas).toEqual([
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined]
    ]);
  }));
  it('should fail, Unknown Command', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 2 6\nDOm';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual('Line 2 - Unknown Command.');
  }));
  it('should fail, Empty file', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = '';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual('File is empty.');
  }));
  it('should fail, Line invalid', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 2 6\nL dom dom';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(
      'Line 2 - Invalid Line Command. Usage: L x1 y1 x2 y2'
    );
  }));
  it('should fail, Rectangle invalid', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 2 6\nR dom dom';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(
      'Line 2 - Invalid Rectangle Command. Usage: R x1 y1 x2 y2'
    );
  }));
  it('should fail, BucketFill invalid', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 2 6\nB dom dom';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(
      'Line 2 - Invalid BucketFill Command. Usage: B x y c'
    );
  }));
  it('should pass, multiple canvas', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 2 6\nL 1 3 1 5\nC 2 2';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(undefined);
    expect(app.canvas).toEqual([
      [undefined, undefined],
      [undefined, undefined]
    ]);
  }));
  it('should fail, bad second canvas', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 2 6\nL 1 3 1 5\nC 2 Fail';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(
      'Line 3 - Invalid Canvas Command. Usage: C w h'
    );
  }));
  it('should fail, non horizontal or vertical line', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 2 6\nL 1 3 2 5';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(
      'Only Horizontal or Vertical lines are supported.'
    );
  }));
  it('should fail, Canvas must have dimensions > 0', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 0 0\nL 1 3 1 5';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual('Canvas must have dimensions > 0');
  }));

  it('should pass, valid canvas', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 20 4\nL 1 2 6 2\nL 6 3 6 4\nR 16 1 20 3\nB 10 3 o';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(undefined);
    expect(app.canvas).toEqual([
      [
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'X',
        'X',
        'X',
        'X',
        'X'
      ],
      [
        'X',
        'X',
        'X',
        'X',
        'X',
        'X',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'X',
        undefined,
        undefined,
        undefined,
        'X'
      ],
      [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'X',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'X',
        'X',
        'X',
        'X',
        'X'
      ],
      [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'X',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o',
        'o'
      ]
    ]);
  }));
  it('should pass, valid drawing', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const content = 'C 3 4\nL 2 2 2 3';
    app._fProcessFile(content);
    expect(app.errorMessage).toEqual(undefined);
    expect(app.canvas).toEqual([
      [undefined, undefined, undefined],
      [undefined, 'X', undefined],
      [undefined, 'X', undefined],
      [undefined, undefined, undefined]
    ]);
    expect(app.drawing).toContain('+---+\n|   |\n| X |\n| X |\n|   |\n+---+');
  }));
});
