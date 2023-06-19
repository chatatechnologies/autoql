import axios from 'axios'

export const apiCallV2 = (widgetOptions, data) => {
    const {
        token,
        apiKey,
        domain
    } = widgetOptions.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const url = `${domain}/autoql/api/v1/query?key=${apiKey}`

    return axios.post(url, data, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCall = (val, options, source, userSelection=undefined) => {
    const {
        token,
        apiKey,
        domain
    } = options.authentication

    const {
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
        test: test,
        translation: "include"
    }

    if(userSelection)data.user_selection = userSelection

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
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCallNotificationCount = (url, options) => {
    const {
        token
    } = options.authentication

    const axiosInstance = axios.create({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    const config = {
        timeout: 180000,
    }

    return axiosInstance
    .get(url, config)
    .then((response) => {
        return Promise.resolve(response)
    })
    .catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}
