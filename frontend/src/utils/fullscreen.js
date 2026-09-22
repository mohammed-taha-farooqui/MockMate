export async function requestBrowserFullscreen(element = document.documentElement) {
  if (document.fullscreenElement) {
    return { success: true };
  }

  if (!element?.requestFullscreen) {
    return {
      success: false,
      error: "Fullscreen is not supported by this browser."
    };
  }

  try {
    await element.requestFullscreen();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Fullscreen permission was denied. You can still continue."
    };
  }
}

export async function enterFullscreen(element = document.documentElement) {
  return requestBrowserFullscreen(element);
}

export async function exitFullscreen() {
  if (!document.fullscreenElement || !document.exitFullscreen) {
    return { success: true };
  }

  try {
    await document.exitFullscreen();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Could not exit fullscreen."
    };
  }
}

export function isFullscreenActive() {
  return Boolean(document.fullscreenElement);
}

export function isFullscreen() {
  return isFullscreenActive();
}
