const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      message: null,
      imageUrls: {},
      token: sessionStorage.getItem("token") || null,
      role: sessionStorage.getItem("role") || null,
      users: [],
      talonarios: [],
      message: { text: "", type: false },
    },
    actions: {
      toggleMessage: (text, type) => {
        setStore({ message: { text: text, type: type } });
      },

      addImageUrl: (url, thumbnail, publicId) => {
        setStore({
          imageUrls: { url: url, thumbnail: thumbnail, publicId: publicId },
        });
      },

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
            `${process.env.BACKEND_URL}/user/login`,
            opts
          );

          if (!response.ok) {
            return false;
          }
          const data = await response.json();
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("role", data.role);
          setStore({ token: data.token });
          setStore({ role: data.role });
          return true;
        } catch (error) {
          console.error("There was been an error login in");
        }
      },

      logout: () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        setStore({ token: null });
        setStore({ role: null });
      },

      getUsers: async () => {
        const store = getStore();
        const opts = {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        };

        try {
          const response = await fetch(`${process.env.BACKEND_URL}/user`, opts);
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

      addUser: async (email, password) => {
        const store = getStore();
        const actions = getActions();
        const opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        };
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/user`, opts);
          if (!response.ok) {
            return false;
          }
          const data = await response.json();

          actions.getUsers();
          return true;
        } catch (error) {
          console.error(error);
        }
      },

      deleteUser: async (userId) => {
        const actions = getActions();
        const opts = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/user/${userId}`,
            opts
          );

          if (!response.ok) {
            alert("No se pudo eliminar");
            return false;
          }
          let data = await response.json();
          actions.getUsers();
          return true;
        } catch (error) {
          console.error(error);
        }
      },

      createTalonario: async (name, prize, numbers, price) => {
        const store = getStore();
        const opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
          body: JSON.stringify({
            name: name,
            prize: prize,
            numbers: parseInt(numbers),
            price: parseFloat(price),
            img_url_prize: store.imageUrls.url,
            img_cloud_id: store.imageUrls.publicId,
          }),
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/talonario`,
            opts
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      getTalonarios: async () => {
        const store = getStore();
        const actions = getActions();

        const opts = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/talonario`,
            opts
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          const data = await response.json();
          setStore({ talonarios: data });
        } catch (error) {
          console.error(error);
          return false;
        }
      },
    },
  };
};

export default getState;
