const adminBasePath = '/admin'
const httpMethods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
}

const adminRoutes = [
    {
        path: adminBasePath + '/invoice/invoice-get-data',
        method: httpMethods.GET,
    },
]

const usersRoutes = []

exports.oAuthRoutes = [...adminRoutes, ...usersRoutes]
exports.adminBasePath = adminBasePath
