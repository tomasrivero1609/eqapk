import axios from 'axios';

export interface DolarQuote {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

const DOLAR_API_BASE = 'https://dolarapi.com/v1/dolares';

export const dolarService = {
  getOficial: async (): Promise<DolarQuote> => {
    const response = await axios.get<DolarQuote>(`${DOLAR_API_BASE}/oficial`);
    return response.data;
  },
  getBlue: async (): Promise<DolarQuote> => {
    const response = await axios.get<DolarQuote>(`${DOLAR_API_BASE}/blue`);
    return response.data;
  },
};
