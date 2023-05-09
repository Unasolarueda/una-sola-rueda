const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      imageUrls: {},
      token: sessionStorage.getItem("token") || null,
      role: sessionStorage.getItem("role") || null,
      users: [],
      talonarios: [],
      talonarioSelect: null,
      talonarioCompra: null,
      reservedTickets: [],
      ticketToreserve: [],
      payments: [],
      tickets: [],
      infoTicket: null,
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
        const actions = getActions();
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
          actions.getTalonarios();
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      updateTalonario: async (talonarioId) => {
        const actions = getActions();
        const opts = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/talonario/${talonarioId}`,
            opts
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          actions.getTalonarios();
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      deleteTalonario: async (talonarioId) => {
        const actions = getActions();
        const opts = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/talonario/${talonarioId}`,
            opts
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          actions.getTalonarios();
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

      getTalonario: async (talonarioId) => {
        const store = getStore();
        const actions = getActions();

        const opts = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/talonario/${talonarioId}`,
            opts
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          const data = await response.json();
          setStore({ talonarioCompra: data });
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      selectTalonario: (talonarioId) => {
        const store = getStore();
        const talonario = store.talonarios.find(
          (talonario) => talonario.id == talonarioId
        );
        setStore({ talonarioSelect: talonario });
      },

      sendPayment: (data) => {
        const store = getStore();
        fetch(`${process.env.BACKEND_URL}/payment/${data.talonario_id}`,{
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer" + "" + store.token,
          },
        })
        .then((res) => {
          if (!res.ok) throw Error(res.statusText);
          return res.json();
        })
        .then((resp) => console.log("Success", resp))
        .catch((error) => console.error(error));
      },

      getTickets: async (talonarioID) => {
        const store = getStore();
        const opts = {
          headers: {
            Authorization: `Bearer ${store.tokenUserTalonario}`,
          },
        };
        const response = await fetch(
          `${process.env.BACKEND_URL}/ticket/${talonarioID}`,
          opts
        );
        try {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          let data = await response.json();
          setStore({ reservedTickets: data });
        } catch (error) {
          console.error(error);
        }
      },

      reserveTickets: async (numbers, talonario_id, payment_id) => {
        const store = getStore();
        const actions = getActions();
        console.log(numbers);

        const opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            numbers: numbers,
            status: "reservado",
            talonario_id: talonario_id,
            payment_id: payment_id,
          }),
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/ticket`,
            opts
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          actions.getTickets(talonario_id);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      buyTickets: async (numberOfTickets, talonarioId, paymentId) => {
        const store = getStore();
        const actions = getActions();
        console.log(numberOfTickets);
        function getRandomTicketNumbers(tickets, numberOfTickets) {
          const ticketsAvailable = tickets.filter(
            (ticket) => ticket.status == "disponible"
          );
          if (numberOfTickets > ticketsAvailable.length) {
            console.log("muchos tickets");
            return false;
          }

          let result = [];

          while (result.length < numberOfTickets) {
            let randomIndex = Math.floor(
              Math.random() * ticketsAvailable.length
            );
            let ticketNumber = ticketsAvailable[randomIndex].numero;
            if (result.indexOf(ticketNumber) === -1) {
              result.push(ticketNumber);
            }
          }

          return result;
        }
        //Llamamos la funcion return false en caso de haber muchos tickets hay que colocar un if para ver si return false o result
        let randomTicketNumbers = getRandomTicketNumbers(
          store.tickets,
          numberOfTickets
        );
        if (randomTicketNumbers) {
          setStore({ ticketToreserve: randomTicketNumbers });
          console.log(randomTicketNumbers);
          const responserReserve = await actions.reserveTickets(
            randomTicketNumbers,
            talonarioId,
            paymentId
          );
          return responserReserve;
        } else {
          return false;
        }
      },

      sendEmailVerifiedPayment: async (paymentId) => {
        const store = getStore();
        const opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
          body: JSON.stringify({
            numbers: store.ticketToreserve,
          }),
        };
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/verified-payment/${paymentId}`,
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

      infoTicket: async (numero, talonarioID) => {
        const response = await fetch(
          `${process.env.BACKEND_URL}/ticket/${numero}/${talonarioID}`
        );
        try {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          const data = await response.json();
          setStore({ infoTicket: data });
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      getPayments: async (talonarioId) => {
        const store = getStore();
        const response = await fetch(
          `${process.env.BACKEND_URL}/payment/${talonarioId}`
        );
        try {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          let data = await response.json();
          setStore({ payments: data });
        } catch (error) {
          console.error(error);
        }
      },

      updatePayment: async (paymentId, talonarioId) => {
        const actions = getActions();
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/payment/${paymentId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          actions.getPayments(talonarioId);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      deletePayment: async (paymentId, talonarioId) => {
        const actions = getActions();
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/payment/${paymentId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          actions.getPayments(talonarioId);
          actions.toggleMessage("Pago eliminado", true);
          return true;
        } catch (error) {
          actions.toggleMessage("El pago no pudo ser eliminado", false);
          console.error(error);
          return false;
        }
      },

      numberFilter: (reservedTickets, numeros) => {
        const store = getStore();
        let num = [];
        const numerosReservados = reservedTickets.map((numero) => {
          if (numero.status == "reservado") {
            return numero.number;
          }
        });

        const numerosPagados = reservedTickets.map((numero) => {
          if (numero.status == "pagado") {
            return numero.number;
          }
        });

        for (let i = 0; i < numeros; i++) {
          if (numerosReservados.includes(i)) {
            num.push({
              value: i.toString().padStart(String(numeros).length - 1, "0"),
              numero: i,
              status: "reservado",
            });
          } else if (numerosPagados.includes(i)) {
            num.push({
              value: i.toString().padStart(String(numeros).length - 1, "0"),
              numero: i,
              status: "pagado",
            });
          } else {
            num.push({
              value: i.toString().padStart(String(numeros).length - 1, "0"),
              numero: i,
              status: "disponible",
            });
          }
        }

        setStore({ tickets: num });
      },
    },
  };
};

export default getState;
