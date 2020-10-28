import axios from 'axios'
import _get from 'lodash.get'

export const apiCall = (val, options, source) => {
    const {
        token,
        apiKey,
        domain
    } = options.authentication

    const {
        debug,
        test
    } = options.autoQLConfig

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const url = `${domain}/autoql/api/v1/query?key=${apiKey}`

    const data = {
        text: val,
        source: source,
        debug: debug,
        test: test
    }

    return axios.post(url, data, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCallPost = (url, data, options) => {
    const {
        token,
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    return axios.post(url, data, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCallPut = (url, data, options) => {
    const {
        token,
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    return axios.put(url, data, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCallDelete = (url, options) => {
    const {
        token,
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    return axios.delete(url, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCallGet = (url, options, extraHeaders={}) => {
    const {
        token
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            ...extraHeaders
        },
    }

    return axios.get(url, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.reject(error)
    })
}
