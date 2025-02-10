import cn from "classnames";

export default function Home() {
  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-between p-24"
      )}
    >
      <h1 className="text-9xl italic">home page</h1>
    </main>
  );
}
