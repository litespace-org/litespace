import cn from "classnames";

export default function Home() {
  return (
    <main
      className={cn("flex grow flex-col items-center justify-between p-24")}
    >
      <h1 className="lg:text-9xl italic text-brand-900 text-center">
        WE ARE LITESPACE
      </h1>
      <p dir="ltr" className="lg:text-4xl text-brand-900 text-center">
        a space designed for you to learn effectively ♥
      </p>
    </main>
  );
}
