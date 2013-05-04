chrome = {
  extension: {
    onRequest: {
      addListener: function() {}
    }
  },

  pageAction: {
    show: function() {},
    onClicked: {
      addListener: function() {}
    }
  },

  storage: {
    sync: {
      get: function() {},
      set: function() {}
    }
  },

  tabs: {
    onUpdated: {
      addListener: function() {}
    },
    onRemoved: {
      addListener: function() {}
    },
    getAllInWindow: function() {},
    getSelected: function() {},
    sendRequest: function() {}
  }
}
