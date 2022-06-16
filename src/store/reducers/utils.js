import { isLoading } from '../action-creators/index'
const initState = {
    isLoading: false
}

const utils = (state = initState, action) => {
    const { payload } = action
    switch (action.type) {
        case isLoading:
            return {
                ...state,
                isLoading: payload 
            }
    
        default:
            return state
    }
}

export default utils