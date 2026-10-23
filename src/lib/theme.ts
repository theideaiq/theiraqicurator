export const THEME_KEY = 'tic-theme';

/** Runs before paint so night mode never flashes white. */
export const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'night':'day'}document.documentElement.dataset.theme=t}catch(e){}})();`;
