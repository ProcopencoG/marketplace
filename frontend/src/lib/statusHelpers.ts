export const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
        case 'neworder': 
        case 'new_order': 
            return 'bg-yellow-100 text-yellow-800';
        case 'confirmed': 
            return 'bg-blue-100 text-blue-800';
        case 'completed': 
            return 'bg-green-100 text-green-800';
        case 'cancelled': 
            return 'bg-red-100 text-red-800';
        default: 
            return 'bg-stone-100 text-stone-800';
    }
 };

 export const getStatusLabel = (status: string) => {
     switch(status?.toLowerCase()) {
        case 'neworder':
        case 'new_order': 
            return 'Comandă Nouă';
        case 'confirmed': 
            return 'Confirmată';
        case 'completed': 
            return 'Finalizată';
        case 'cancelled': 
            return 'Anulată';
        default: 
            return status;
    }
 };
