describe('Sprite', function() {
  var pInst;

  beforeEach(function() {
    pInst = new p5(function() {});
  });

  afterEach(function() {
    pInst.remove();
  });

  it('sets correct coordinate mode for rendering', function() {
    // Note: This test reaches into p5's internals somewhat more than usual.
    // It's designed to catch a particular rendering regression reported in
    // issue #48, where certain local constants are initialized incorrectly.
    // See https://github.com/molleindustria/p5.play/issues/48
    expect(p5.prototype.CENTER).to.not.be.undefined;
    var rectMode, ellipseMode, imageMode;

    // Monkeypatch sprite's draw method to inspect coordinate mode at draw-time.
    var sprite = pInst.createSprite();
    sprite.draw = function() {
      rectMode = pInst._renderer._rectMode;
      ellipseMode = pInst._renderer._ellipseMode;
      imageMode = pInst._renderer._imageMode;
    };
    pInst.drawSprites();

    // Check captured modes.
    expect(rectMode).to.equal(p5.prototype.CENTER);
    expect(ellipseMode).to.equal(p5.prototype.CENTER);
    expect(imageMode).to.equal(p5.prototype.CENTER);
  });

  describe('getDirection', function() {
    var sprite;

    beforeEach(function() {
      sprite = pInst.createSprite();
    });

    function checkDirectionForVelocity(v, d) {
      sprite.velocity.x = v[0];
      sprite.velocity.y = v[1];
      expect(sprite.getDirection()).to.equal(d);
    }

    it('returns zero when there is no velocity', function() {
      checkDirectionForVelocity([0, 0], 0);
    });

    it('positive or zero y velocity gives a positive direction', function() {
      checkDirectionForVelocity([-1, 0], 180);
      checkDirectionForVelocity([0, 0], 0);
      checkDirectionForVelocity([1, 0], 0);

      checkDirectionForVelocity([-1, 1], 135);
      checkDirectionForVelocity([0, 1], 90);
      checkDirectionForVelocity([1, 1], 45);
    });

    it('negative y velocity gives a negative direction', function() {
      checkDirectionForVelocity([-1, -1], -135);
      checkDirectionForVelocity([0, -1], -90);
      checkDirectionForVelocity([1, -1], -45);
    });

    it('returns degrees when p5 angleMode is RADIANS', function() {
      pInst.angleMode(p5.prototype.RADIANS);
      checkDirectionForVelocity([1, 1], 45);
      checkDirectionForVelocity([0, 1], 90);
    });

    it('returns degrees when p5 angleMode is DEGREES', function() {
      pInst.angleMode(p5.prototype.DEGREES);
      checkDirectionForVelocity([1, 1], 45);
      checkDirectionForVelocity([0, 1], 90);
    });

  });

  describe('dimension updating when animation changes', function() {
    it('animation width and height get inherited from frame', function() {
      var image = new p5.Image(100, 100, pInst);
      var frames = [
        {name: 0, frame: {x: 0, y: 0, width: 30, height: 30}}
      ];
      var sheet = new pInst.SpriteSheet(image, frames);
      var animation = new pInst.Animation(sheet);

      var sprite = pInst.createSprite(0, 0);
      sprite.addAnimation('label', animation);

      expect(sprite.width).to.equal(30);
      expect(sprite.height).to.equal(30);
    });

    it('updates the width and height property when frames are different sizes', function() {
      var image = new p5.Image(100, 100, pInst);
      var frames = [
        {name: 0, frame: {x: 0, y: 0, width: 50, height: 50}},
        {name: 1, frame: {x: 100, y: 0, width: 40, height: 60}},
        {name: 2, frame: {x: 0, y: 80, width: 70, height: 30}}
      ];
      var sheet = new pInst.SpriteSheet(image, frames);
      var animation = new pInst.Animation(sheet);

      var sprite = pInst.createSprite(0, 0);
      sprite.addAnimation('label', animation);

      expect(sprite.width).to.equal(50);
      expect(sprite.height).to.equal(50);

      // Frame changes after every 4th update because of frame delay.
      sprite.update();
      sprite.update();
      sprite.update();
      sprite.update();
      expect(sprite.width).to.equal(40);
      expect(sprite.height).to.equal(60);

      sprite.update();
      sprite.update();
      sprite.update();
      sprite.update();
      expect(sprite.width).to.equal(70);
      expect(sprite.height).to.equal(30);
    });
  });
});
