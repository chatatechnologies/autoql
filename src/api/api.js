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
        if (error.message === 'Parse error') {
            return Promise.reject({ error: 'Parse error' })
        }
        if (error.response === 401 || !_get(error, 'response.data')) {
            return Promise.reject({ error: 'Unauthenticated' })
        }
        if (
            _get(error, 'response.data.reference_id') === '1.1.430' ||
            _get(error, 'response.data.reference_id') === '1.1.431'
        ) {
            console.log('FETCH SUGGESTIONS');
            return Promise.resolve(_get(error, 'response'))
        }
        return Promise.reject(_get(error, 'response.data'))
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
