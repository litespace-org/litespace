import ReactDOMServer from "react-dom/server";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Tour, TourConfig } from "@/types/tour";

export function getTourIds(tour: Tour): string[] {
  return tour.map((step) => step.id);
}

export function getDriver(tour: Tour, config?: TourConfig) {
  const driverObj = driver({
    steps: tour.map((step) => ({
      element: `#${step.id}`,
      popover: {
        title: step.info.title,
        description: step.info.description,
      },
    })),

    onDestroyStarted: config?.onStop || undefined,

    onPopoverRender: (popover) => {
      const buttonsContainer = document.createElement("div");
      buttonsContainer.style.display = "flex";
      buttonsContainer.style.flexDirection = "row-reverse";
      buttonsContainer.style.justifyContent = "end";
      buttonsContainer.style.gap = "8px";
      buttonsContainer.style.marginTop = "8px";

      if (config?.nextButton) {
        const btnStr = ReactDOMServer.renderToStaticMarkup(config.nextButton);
        const btn = new DOMParser()
          .parseFromString(btnStr, "text/html")
          .querySelector("button");
        const innerDiv = btn?.querySelector("div");
        if (innerDiv) innerDiv.style.fontFamily = "Cairo, sans-serif";
        btn?.addEventListener("click", (e) => {
          if (btn.onclick) btn.onclick(e);
          if (driverObj.hasNextStep()) driverObj.moveNext();
          else driverObj.destroy();
        });
        if (btn) buttonsContainer.appendChild(btn);
      }
      if (config?.prevButton) {
        const btnStr = ReactDOMServer.renderToStaticMarkup(config.prevButton);
        const btn = new DOMParser()
          .parseFromString(btnStr, "text/html")
          .querySelector("button");
        const innerDiv = btn?.querySelector("div");
        if (innerDiv) innerDiv.style.fontFamily = "Cairo, sans-serif";
        btn?.addEventListener("click", (e) => {
          if (btn.onclick) btn.onclick(e);
          driverObj.movePrevious();
        });
        if (btn) buttonsContainer.appendChild(btn);
      }

      popover.footer.remove();
      popover.closeButton.remove();
      popover.wrapper.appendChild(buttonsContainer);

      popover.title.style.fontFamily = "Cairo, sans-serif";
      popover.title.style.fontSize = "1em";
      popover.description.style.fontFamily = "Cairo, sans-serif";
    },
  });

  return driverObj;
}
