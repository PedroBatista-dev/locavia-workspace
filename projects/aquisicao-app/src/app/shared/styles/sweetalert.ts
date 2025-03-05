import Swal from "sweetalert2"

// os estilos listados em cada item do componte estão definidos no arquivo global de estilhos (styles.scss)
const customSwal = Swal.mixin({
    customClass: {
        confirmButton: 'swal-button-confirm',
        cancelButton: 'swal-button-cancel',
    },
    reverseButtons: true
})

const originalFire = customSwal.fire;

customSwal.fire = function(...args) {
  return originalFire.apply(this, args as [string | undefined]).then((result) => {
    if (result.isConfirmed) {
      customSwal.getConfirmButton()!.disabled = true;
    }
    return result;
  });
};

export {
    customSwal
}