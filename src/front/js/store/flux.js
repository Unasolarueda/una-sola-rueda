const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      message: null,
      token: sessionStorage.getItem("token") || null,
      users: [],
    },
    actions: {
      login: async (email, password) => {
        const opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/login`,
            opts
          );

          if (!response.ok) {
            return false;
          }
          const data = await response.json();
          sessionStorage.setItem("token", data.token);
          setStore({ token: data.token });
          return true;
        } catch (error) {
          console.error("There was been an error login in");
        }
      },

      getUsers: async () => {
        const store = getStore();
        const opts = {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        };

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/user`,
            opts
          );
          if (!response.ok) {
            alert("no se pudo obteber usuarios");
            return false;
          }

          const data = await response.json();
          setStore({ users: data });
          return true;
        } catch (error) {
          console.error(error);
        }
      },
    },
  };
};

export default getState;
