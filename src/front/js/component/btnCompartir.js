import React from "react";

export const BtnCompartir = (props) => {
  const handleClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Something",
          text: "Hello, please come visit my website",
          url: `/comprar/${props.talonario?.id}`,
        })
        .then(() => {
          console.log("Successfully shared");
        })
        .catch((error) => {
          console.error("Something went wrong", error);
        });
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-center my-2">
        <div className="text-center mt-3 d-flex justify-content-center gap-2">
          <div className="text-center fs-4 fw-bold d-flex">Compartir</div>
          <button className="btn btn-primary w-50" onClick={handleClick}>
            <i className="fa-solid fa-link"></i> Link
          </button>
        </div>
      </div>
    </>
  );
};
