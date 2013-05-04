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
  });
});
