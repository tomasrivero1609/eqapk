import React, { useMemo, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
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
  const [isSharing, setIsSharing] = useState(false);

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
  const paidDateText = new Date(payment.paidAt).toLocaleDateString('es-AR');
  const rateDateText = payment.exchangeRateDate
    ? new Date(payment.exchangeRateDate).toLocaleDateString('es-AR')
    : null;
  const hasSectionCovered =
    (payment.adultCovered || 0) > 0 ||
    (payment.juvenileCovered || 0) > 0 ||
    (payment.childCovered || 0) > 0;

  const handleShareReceipt = async () => {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('No disponible', 'No se puede compartir desde este dispositivo.');
        return;
      }
      setIsSharing(true);

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
              h1 { font-size: 20px; margin: 0 0 12px; }
              .section { margin-top: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; }
              .label { font-size: 12px; color: #475569; margin-bottom: 4px; }
              .value { font-size: 14px; font-weight: 600; }
              .row { display: flex; justify-content: space-between; gap: 12px; }
              .muted { color: #64748b; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>Comprobante de pago</h1>
            ${eventName ? `<div class="muted">Evento: ${eventName}</div>` : ''}
            <div class="section">
              <div class="label">Monto</div>
              <div class="value">${formatCurrency(payment.amount, payment.currency)}</div>
              <div class="muted">Fecha de pago: ${paidDateText}</div>
            </div>
            <div class="section">
              <div class="row">
                <div>
                  <div class="label">Moneda del evento</div>
                  <div class="value">${eventCurrency}</div>
                </div>
                <div>
                  <div class="label">Metodo</div>
                  <div class="value">${payment.method || 'No especificado'}</div>
                </div>
              </div>
            </div>
            ${
              showConversion
                ? `<div class="section">
                    <div class="label">Equivalente en ${eventCurrency}</div>
                    <div class="value">${formatCurrency(equivalent, eventCurrency)}</div>
                    ${
                      exchangeRate
                        ? `<div class="muted">Tipo de cambio: Dolar blue venta ${exchangeRate}${
                            payment.exchangeRate ? ' (guardado)' : ' (actual)'
                          }</div>`
                        : `<div class="muted">Sin tipo de cambio blue disponible.</div>`
                    }
                    ${rateDateText ? `<div class="muted">Fecha de cotizacion: ${rateDateText}</div>` : ''}
                  </div>`
                : ''
            }
            ${
              hasSectionCovered
                ? `<div class="section">
                    <div class="label">Platos cubiertos</div>
                    <div class="value">${payment.adultCovered || 0} Adultos / ${
                    payment.juvenileCovered || 0
                  } Juveniles / ${payment.childCovered || 0} Infantiles</div>
                    ${
                      payment.adultPriceAtPayment || payment.juvenilePriceAtPayment || payment.childPriceAtPayment
                        ? `<div class="muted">Precios al pago: ${formatCurrency(
                            payment.adultPriceAtPayment || 0,
                            eventCurrency,
                          )} A · ${formatCurrency(
                            payment.juvenilePriceAtPayment || 0,
                            eventCurrency,
                          )} J · ${formatCurrency(
                            payment.childPriceAtPayment || 0,
                            eventCurrency,
                          )} I</div>`
                        : ''
                    }
                  </div>`
                : payment.platesCovered
                ? `<div class="section">
                    <div class="label">Platos cubiertos</div>
                    <div class="value">${payment.platesCovered}</div>
                    ${
                      payment.pricePerDishAtPayment
                        ? `<div class="muted">Precio por plato al pago: ${formatCurrency(
                            payment.pricePerDishAtPayment,
                            eventCurrency,
                          )}</div>`
                        : ''
                    }
                  </div>`
                : ''
            }
            ${
              payment.notes
                ? `<div class="section">
                    <div class="label">Notas</div>
                    <div class="value">${payment.notes}</div>
                  </div>`
                : ''
            }
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el comprobante.');
    } finally {
      setIsSharing(false);
    }
  };

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

        {(payment.platesCovered || hasSectionCovered || payment.method || payment.notes) && (
          <Card>
            <Text className="text-xs font-semibold text-slate-400">Detalles</Text>
            {hasSectionCovered ? (
              <View className="mt-3">
                <Text className="text-xs font-semibold text-slate-400">
                  Platos cubiertos
                </Text>
                <Text className="mt-1 text-sm text-slate-300">
                  {payment.adultCovered || 0} Adultos / {payment.juvenileCovered || 0} Juveniles /{' '}
                  {payment.childCovered || 0} Infantiles
                </Text>
                {payment.adultPriceAtPayment || payment.juvenilePriceAtPayment || payment.childPriceAtPayment ? (
                  <Text className="mt-1 text-xs text-slate-500">
                    Precios al pago {formatCurrency(payment.adultPriceAtPayment || 0, eventCurrency)} A ·{' '}
                    {formatCurrency(payment.juvenilePriceAtPayment || 0, eventCurrency)} J ·{' '}
                    {formatCurrency(payment.childPriceAtPayment || 0, eventCurrency)} I
                  </Text>
                ) : null}
              </View>
            ) : payment.platesCovered ? (
              <View className="mt-3">
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
              <View className={payment.platesCovered || hasSectionCovered ? 'mt-4' : 'mt-3'}>
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

        <View className="pt-2">
          <Button
            label="Compartir comprobante"
            variant="secondary"
            onPress={handleShareReceipt}
            loading={isSharing}
          />
        </View>
      </View>
    </Screen>
  );
}
