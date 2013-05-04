describe('colourizer', function() {
  describe('has_color', function() {
    it('should return true when string has color', function() {
      var actual = page_colourizer.has_color('rgb(255, 30, 15)');
      expect(actual).toBeTruthy();
    });

    it('should return true when string has transparent color', function() {
      var actual = page_colourizer.has_color('rgba(0, 0, 0, 0)');
      expect(actual).toBeFalsy();
    });
  });

  describe('split_rgb_code', function() {
    it('should return array of integers', function() {
      var expected = [15, 118, 0];
      var actual = page_colourizer.split_rgb_code('rgb(15, 118, 0)');
      expect(actual).toEqual(expected);
    });

    it('should handle rgba', function() {
      var expected = [8, 22, 127];
      var actual = page_colourizer.split_rgb_code('rgba(8, 22, 127, 0.5)');
      expect(actual).toEqual(expected);
    });
  });

  describe('constrain_rgb', function() {
    it('should return 0 or greater', function() {
      var expected = 0;
      var actual = page_colourizer.constrain_rgb(-3.432);
      expect(actual).toEqual(expected);

      expected = 5;
      actual = page_colourizer.constrain_rgb(5);
      expect(actual).toEqual(expected);
    });

    it('should return 255 or less', function() {
      var expected = 255;
      var actual = page_colourizer.constrain_rgb(264);
      expect(actual).toEqual(expected);

      expected = 254;
      actual = page_colourizer.constrain_rgb(254.3);
      expect(actual).toEqual(expected);
    });
  });

  describe('get_palette_url', function() {
    it('should return CL API random palette URL when no options', function() {
      var expected = page_colourizer.random_palette_url;
      var actual = page_colourizer.get_palette_url({});
      expect(actual).toEqual(expected);
    });

    it('should return top palette URL when top_colors', function() {
      var expected = page_colourizer.top_palette_url;
      var actual = page_colourizer.get_palette_url({
        selection_method: 'top_colors'
      });
      expect(actual.indexOf(expected)).toEqual(0);
    });

    it('should return new palette URL when new_colors', function() {
      var expected = page_colourizer.new_palette_url;
      var actual = page_colourizer.get_palette_url({
        selection_method: 'new_colors'
      });
      expect(actual.indexOf(expected)).toEqual(0);
    });
  });

  describe('get_pattern_url', function() {
    it('should return CL API random pattern URL when no options', function() {
      var expected = page_colourizer.random_pattern_url;
      var actual = page_colourizer.get_pattern_url({});
      expect(actual).toEqual(expected);
    });

    it('should return top pattern URL when top_colors', function() {
      var expected = page_colourizer.top_pattern_url;
      var actual = page_colourizer.get_pattern_url({
        selection_method: 'top_colors'
      });
      expect(actual.indexOf(expected)).toEqual(0);
    });

    it('should return new pattern URL when new_colors', function() {
      var expected = page_colourizer.new_pattern_url;
      var actual = page_colourizer.get_pattern_url({
        selection_method: 'new_colors'
      });
      expect(actual.indexOf(expected)).toEqual(0);
    });
  });
});
