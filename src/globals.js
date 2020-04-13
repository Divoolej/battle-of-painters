export const initGlobals = () => {
  window.main = document.getElementById('main');
  window.loader = document.getElementById('loader');
  window.playButton = document.getElementById('play');
  window.background = document.getElementById('background');
  window.foreground = document.getElementById('foreground');
  window.countdown = document.getElementById('countdown');
  window.bgGfx = background.getContext('2d', { alpha: false });
  window.fgGfx = foreground.getContext('2d');
  window.scale = 1;
  window.board = [];
  window.players = [];
  window.frames = [];
  window.pings = [];
  window.lastPing = Date.now();
  window.lastFrameBackup = null;
  const params = new URLSearchParams(window.location.search);
  window.roomId = params.get('roomId');
  window.playerId = params.get('userId');
};
