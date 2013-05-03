/*
 * Copyright 2013 Sarah Vessels
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function save_options() {
  var color_source = $('input[name="color_source"]:checked').val();
  var colour_frenzy = $('#colour_frenzy').is(':checked');
  var status_area = $('#status-message');
  var options = {color_source: color_source,
                 colour_frenzy: colour_frenzy};
  chrome.storage.sync.set({'colourizer_options': options}, function() {
    status_area.text('Okay, got it!').fadeIn(function() {
      setTimeout(function() {
        status_area.fadeOut();
      }, 2000);
    });
  });
}

function restore_options() {
  chrome.storage.sync.get('colourizer_options', function(opts) {
    opts = opts.colourizer_options;
    if (opts.color_source) {
      var selector = 'input[name="color_source"][value="' + opts.color_source +
                     '"]';
      $(selector).attr('checked', 'checked');
    } else {
      $('#palettes_only').attr('checked', 'checked');
    }
    if (opts.colour_frenzy) {
      $('#colour_frenzy').attr('checked', 'checked');
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
$('#palettes_only').on('change', save_options);
$('#palettes_and_patterns').on('change', save_options);
$('#patterns_only').on('change', save_options);
$('#colour_frenzy').on('change', save_options);
