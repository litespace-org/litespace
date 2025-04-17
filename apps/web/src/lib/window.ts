interface Window {
  toggleSimulatMobile: () => void;
}

declare let window: Window;

const keys = { simulateMobile: "litespace:dev:simulate-mobile" };

export function simulateMobile() {
  return !!localStorage.getItem(keys.simulateMobile);
}

window.toggleSimulatMobile = () => {
  const key = keys.simulateMobile;
  const simulate = simulateMobile();
  if (simulate) {
    localStorage.removeItem(key);
    console.log('Simualte phone "off"');
    return;
  }

  localStorage.setItem(key, "true");
  console.log('Simualte phone "on"');
};
