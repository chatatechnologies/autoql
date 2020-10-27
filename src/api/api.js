import axios from 'axios'

export const apiCall = (url, data, options) => {
    const {
        token
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    return axios.post(url, data, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.reject(error)
    })
}

export const apiCallGet = (url, options) => {
    const {
        token
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    return axios.get(url, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.reject(error)
    })
}
