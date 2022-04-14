import React, { useEffect, useState } from 'react';
import { Auth } from './auth';
import supabase from 'lib/supabase';

export function AdminLayout({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const session = supabase.auth.session();
    if (session) setSession(session);

    supabase.auth.onAuthStateChange((event, session) => {
      if (event == 'SIGNED_IN') setSession(session);
      else if (event == 'SIGNED_OUT') setSession(false);
    });
  }, []);

  const logout = () => {
    supabase.auth.signOut();
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { session });
    }
    return child;
  });
  console.log(session);

  return session ? (
    <>
      <div className="bg-black flex px-2 text-white font-sans font-medium text-sm py-1">
        <div>
          <p>Loggato come {session.user.email}</p>
        </div>
        <div className="ml-auto">
          <button
            className="bg-red-500 px-2 rounded-sm"
            onClick={() => logout()}
          >
            Log out
          </button>
        </div>
      </div>
      {childrenWithProps}
    </>
  ) : (
    <Auth />
  );
}
