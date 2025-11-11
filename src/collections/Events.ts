import { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  auth:true,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    }
  ],
  
  endpoints:[
    {
      path:'/', 
      method:'get',
      handler : async (req:any) => {
        try{
            if (!req.user) {
                return Response.json({
                    message: 'Unauthorized access. Please log in.',
                });
            }

            const seminarsData = await req.payload.find({
                collection: 'seminars'
            })
            const webinarsData = await req.payload.find({
                collection: 'webinars'
            })

            const seminarsFilterData = seminarsData.docs.map((d:any)=>{
                let obj = {
                    title:d.title,
                    startDate:d.dates[0].startDate,
                    endDate:d.dates[0].endDate,
                    doc:{
                        relationTo:"seminars",
                        value:d.dates[0].id
                    }
                }
                return obj
            })
            const webinarsFilterData = webinarsData.docs.map((d:any)=>{
                let obj = {
                    title:d.title,
                    startDate:d.dates[0].startDate,
                    endDate:d.dates[0].endDate,
                    doc:{
                        relationTo:"webinars",
                        value:d.dates[0].id
                    }
                }
                return obj
            })

            let data = [...seminarsFilterData , ...webinarsFilterData]

            const currDate = (new Date()).toISOString()

            data = data.filter((d:any)=>{
                return (d.startDate > currDate);
            })
            
            data.sort((a:any,b:any):any => {
                return new Date(a.startDate.split('T')[0]).getTime() - new Date(b.startDate.split('T')[0]).getTime();
            })
            
            return Response.json({
                data,
                currDate
            })
        }catch(e){
            return Response.json({
                message:"Error to load events..",
            })
        }
      } 
    }
  ]
}