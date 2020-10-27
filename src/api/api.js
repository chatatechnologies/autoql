import axios from 'axios'

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
        console.log(error);
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
