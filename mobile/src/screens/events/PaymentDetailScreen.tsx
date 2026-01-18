import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import { Payment, Currency } from '../../types';
import { formatCurrency } from '../../utils/format';
import { convertAmount } from '../../utils/currency';
import { dolarService } from '../../services/dolarService';

export default function PaymentDetailScreen({ route }: any) {
  const { payment, eventCurrency, eventName } = route.params as {
    payment: Payment;
    eventCurrency: Currency;
    eventName?: string;
  };

  const { data: dolarBlue } = useQuery({
    queryKey: ['dolar-blue'],
    queryFn: () => dolarService.getBlue(),
    staleTime: 5 * 60 * 1000,
  });

  const exchangeRate = payment.exchangeRate ?? dolarBlue?.venta;
  const equivalent = useMemo(() => {
    return convertAmount(payment.amount, payment.currency, eventCurrency, exchangeRate);
  }, [payment.amount, payment.currency, eventCurrency, exchangeRate]);

  const showConversion = payment.currency !== eventCurrency;

  return (
    <Screen>
      <View className="px-6 pt-6">
        <Text className="text-2xl font-bold text-slate-100">Detalle del pago</Text>
        {eventName ? (
          <Text className="mt-2 text-sm text-slate-400">Evento: {eventName}</Text>
        ) : null}
      </View>

      <View className="mt-6 px-6 space-y-4">
        <Card>
          <Text className="text-xs font-semibold text-slate-400">Monto</Text>
          <Text className="mt-1 text-xl font-bold text-slate-100">
            {formatCurrency(payment.amount, payment.currency)}
          </Text>
          <Text className="mt-2 text-xs text-slate-400">
            Fecha {new Date(payment.paidAt).toLocaleDateString('es-AR')}
          </Text>
        </Card>

        {showConversion && (
          <Card>
            <Text className="text-xs font-semibold text-slate-400">
              Conversion a {eventCurrency}
            </Text>
            {exchangeRate ? (
              <>
                <Text className="mt-1 text-base font-semibold text-slate-100">
                  {formatCurrency(equivalent, eventCurrency)}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  Tipo de cambio usado: Dolar blue venta {exchangeRate}
                  {payment.exchangeRate ? ' (guardado)' : ' (actual)'}
                </Text>
                {payment.exchangeRateDate ? (
                  <Text className="mt-1 text-xs text-slate-500">
                    Fecha de cotizacion{' '}
                    {new Date(payment.exchangeRateDate).toLocaleDateString('es-AR')}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text className="mt-1 text-xs text-slate-500">
                Sin tipo de cambio blue disponible.
              </Text>
            )}
          </Card>
        )}

        {(payment.platesCovered || payment.method || payment.notes) && (
          <Card>
            {payment.platesCovered ? (
              <View>
                <Text className="text-xs font-semibold text-slate-400">
                  Platos cubiertos
                </Text>
                <Text className="mt-1 text-sm text-slate-300">
                  {payment.platesCovered}
                </Text>
                {payment.pricePerDishAtPayment ? (
                  <Text className="mt-1 text-xs text-slate-500">
                    Precio por plato al pago{' '}
                    {formatCurrency(payment.pricePerDishAtPayment, eventCurrency)}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {payment.method ? (
              <View className={payment.platesCovered ? 'mt-4' : undefined}>
                <Text className="text-xs font-semibold text-slate-400">Metodo</Text>
                <Text className="mt-1 text-sm text-slate-300">{payment.method}</Text>
              </View>
            ) : null}
            {payment.notes ? (
              <View className="mt-4">
                <Text className="text-xs font-semibold text-slate-400">Notas</Text>
                <Text className="mt-1 text-sm text-slate-300">{payment.notes}</Text>
              </View>
            ) : null}
          </Card>
        )}
      </View>
    </Screen>
  );
}
