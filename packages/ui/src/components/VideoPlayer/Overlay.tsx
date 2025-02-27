import React from "react";
import cn from "classnames";

const style = {
  backgroundImage:
    'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADcCAYAAACxtct4AAAAAXNSR0IArs4c6QAAASZJREFUOE9lyOdHBWAYhvHT3nvvOu299zjNc05TJJEkkkgSSSSJJJJEEkkiifRH5ro/PK9Xz4ef+3oCgX8Xw8cRS4o4I54lEnwSSZFkJLNEik8qKdKMdJYjgxSZRhZLZPvkkCLXyGM58klRYBSyHEWkKDZKWKLUp4wU5UYFS1T6VJGi2qhhOYKkqDXqWI56UjQYjSzR5NNMihajlSXafNpJ0WF0shxdpOg2eliOXlL0Gf0sMeAzSIohY5glRnxGSTFmjLMcE6QIGZMsxxQppo0Zlpj1mSNF2IiwRNRnnhQLxiLLsUSKZViBVViDddiATdiCbdiBXdiDfTiAQziCYziBUziDc7iAS7iCa7iBW7iDe3iAR3iCZ3iBV3iDd/iAT/iCb/iB3z8Uzy72iTnEKAAAAABJRU5ErkJggg==")',
} as const;

const Overlay: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn("absolute bottom-0 w-full z-[4] h-[220px] cursor-pointer")}
      data-layer="4"
      style={style}
    />
  );
};

export default Overlay;
