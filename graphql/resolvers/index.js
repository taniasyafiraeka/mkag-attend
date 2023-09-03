const personResolvers=require('./person.resolver')
const eventResolvers=require('./event.resolver')
const notificationResolvers=require('./notification.resolver')
const attendanceResolvers=require('./attendance.resolver')
const facePhotoResolvers=require('./facePhoto.resolver')
const trxResolvers=require('./trx.resolver')

module.exports={
    Query: {
        ...personResolvers.Query,
        ...eventResolvers.Query,
        ...notificationResolvers.Query,
        ...attendanceResolvers.Query,
        ...facePhotoResolvers.Query,
        ...trxResolvers.Query
    },
    Mutation: {
        ...personResolvers.Mutation,
        ...eventResolvers.Mutation,
        ...notificationResolvers.Mutation,
        ...attendanceResolvers.Mutation,
        ...facePhotoResolvers.Mutation,
        ...trxResolvers.Mutation
    }
}