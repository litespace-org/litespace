import React, { SVGProps, useMemo } from "react";
import Color from "color";
import MersenneTwister from "mersenne-twister";

const DEFAULT_SHAPE_COUNT = 3;

const DEFAULT_WOBBLE = 30;

const DEFAULT_BASE_COLORS = [
  "#4CAF4F", // teal
  "#FC7500", // bright orange
  "#2E6B30", // dark teal
  "#F73F01", // orangered
  "#FC1960", // magenta
  "#C7144C", // raspberry
  "#F3C100", // goldenrod
  "#1598F2", // lightning blue
  "#2465E1", // sail blue
  "#F19E02", // gold
];

function hash(input: string): number {
  return input.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}

export const JazzIcon: React.FC<{ seed: string } & SVGProps<SVGSVGElement>> = ({
  seed,
  ...props
}) => {
  const shapes = useMemo(() => {
    const generator = new MersenneTwister(hash(seed));
    const position = generator.random();
    const hueShift = 30 * position - DEFAULT_WOBBLE / 2;
    const colors = DEFAULT_BASE_COLORS.map((hex) =>
      Color(hex).rotate(hueShift).hex()
    );

    function nextColor(): string {
      const position = generator.random();
      const index = Math.floor(colors.length * position);
      const [color] = colors.splice(index, 1);
      return color || "#FFFFFF";
    }

    function nextTransform(index: number): string {
      const firstRotation = generator.random();
      const boost = generator.random();
      const secondRotation = generator.random();
      const angle = 2 * Math.PI * firstRotation;
      const velocity = (100 * (index + boost)) / DEFAULT_SHAPE_COUNT;
      const x = Math.cos(angle) * velocity;
      const y = Math.sin(angle) * velocity;
      const r = firstRotation * 360 + secondRotation * 180;
      return (
        "translate(" +
        x.toFixed(3) +
        " " +
        y.toFixed(3) +
        ") rotate(" +
        r.toFixed(1) +
        " 50 50)"
      );
    }

    const shapes = [
      `<rect x="0" y="0" width="100%" height="100%" fill="${nextColor()}" />`,
    ];

    for (let i = 0; i < DEFAULT_SHAPE_COUNT; i++) {
      shapes.push(
        '<rect x="0" y="0" width="100%" height="100%" rx="8" transform="' +
          nextTransform(i) +
          '" fill="' +
          nextColor() +
          '" />'
      );
    }

    return shapes;
  }, [seed]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      dangerouslySetInnerHTML={{ __html: shapes.join("") }}
      {...props}
    />
  );
};
