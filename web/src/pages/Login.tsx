import React, { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import supabase from "@/api/supabase";
import { Session } from "@supabase/supabase-js";

const Login: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // if (!session)
  //   return (
  //     <div className="max-w-screen-md mx-auto">
  //       <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
  //     </div>
  //   );

  console.log({ session });

  return (
    <div className="max-w-screen-md mx-auto my-10">
      <p>Login</p>
      <div>
        <button
          onClick={() => {
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `http://example.com/auth/callback`,
              },
            });
          }}
        >
          Login using google
        </button>
      </div>
    </div>
  );
};

export default Login;
