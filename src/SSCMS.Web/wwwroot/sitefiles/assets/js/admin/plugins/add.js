﻿var $url = '/plugins/add';

var data = utils.init({
  isNightly: null,
  version: null,
  packageIds: null,
  q: utils.getQueryString('q'),
  keyword: utils.getQueryString('q') || '',
  plugins: null
});

var methods = {
  getIconUrl: function (iconUrl) {
    return $urlCloudStorage + '/' + iconUrl;
  },

  getTagNames: function (pluginInfo) {
    var tagNames = [];
    if (pluginInfo.tags) {
      tagNames = pluginInfo.tags.split(',');
    }
    return tagNames;
  },

  apiGet: function () {
    var $this = this;

    $api.get($url).then(function (response) {
      var res = response.data;

      var server = response.headers['server'];
      if (!server || server === 'Kestrel') {
        utils.error('页面加载失败，SSCMS 插件需要在进程管理器（Nginx、Apache、IIS、Windows 服务）中运行，请参考文档 <a href="https://sscms.com/docs/v7/getting-started/deploy.html" target="_blank">托管和部署</a>', {
          redirect: true
        });
        return;
      }

      $this.isNightly = res.isNightly;
      $this.version = res.version;
      $this.packageIds = res.packageIds;

      $cloudApi.getPlugins($this.keyword).then(function (response) {
        var plugins = response.data;
  
        $this.plugins = plugins;
        utils.loading($this, false);
      });
    }).catch(function (error) {
      utils.error(error);
    });
  },

  getLatestVersion: function(plugin) {
    return this.isNightly ? plugin.latestNightlyVersion : plugin.latestStableVersion;
  },

  getLatestPublished: function(plugin) {
    return this.isNightly ? plugin.latestNightlyPublished : plugin.latestStablePublished;;
  },

  btnSearchClick: function () {
    location.href = '?q=' + this.keyword;
  },

  btnUploadClick: function () {
    utils.openLayer({
      title: '离线安装插件',
      url: utils.getPluginsUrl('addLayerUpload'),
      width: 550,
      height: 350
    });
  },

  btnViewClick: function(plugin) {
    utils.addTab('插件：' + plugin.pluginId, utils.getPluginsUrl('view', {pluginId: plugin.pluginId}));
  }
};

var $vue = new Vue({
  el: '#main',
  data: data,
  methods: methods,
  created: function () {
    this.apiGet();
  }
});