import { toast } from "react-toastify"

const option =  {
    position: "top-right",
    autoClose: 1000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
}

export const toastSuccess = (title, params = option) => {
    toast.success(title, params)
}

export const toastError = (title, params = option) => {
    toast.error(title, params)
}

export const toastWarn = (title, params = option) => {
    toast.warning(title, params)
}