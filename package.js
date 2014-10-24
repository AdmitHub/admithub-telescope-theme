Package.describe({
  name: "admithub:admithub-telescope-theme",
  summary: "AdmitHub theme for Telescope",
  version: "0.0.0",
  git: "https://github.com/AdmitHub/admithub-telescope-theme.git"
});

Package.onUse(function (api) {

  api.use(['telescope-lib', 'telescope-base', 'stylus']);
  api.addFiles(['lib/admithub.js', 'lib/client/css/screen.styl']);
});
