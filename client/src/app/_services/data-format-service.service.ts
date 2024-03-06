import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class DataFormatServiceService {
  constructor() {}

  isFormatCurrency = localStorage.getItem('isFormatCurrency');

  convertStringToDate(value: string) {
    const [day, month, year] = value.split('/');
    return new Date(+year, +month - 1, +day);
  }

  // Tiền
  moneyFormat(value: Number | number | string) {
    return value
      ? Math.round(Number(value))
          .toString()
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      : '0';
  }

  moneyFormat1(value: Number | number | string) {
    if (this.isFormatCurrency == '0') {
      return value
        ? Math.round(Number(value))
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
        : '0';
    } else
      return value
        ? Math.round(Number(value))
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        : '0';
  }

  // Số
  numberFormat(value: string | number) {
    if (value === 0) {
      return '0';
    }
    // @ts-ignore
    // return value ? parseFloat(Math.round((+value) * 100) / 100).toFixed(2) : '';
    return value ? parseFloat(value).toString() : '';
  }

  numberValidate(value: string | number) {
    const NUMBER_REGEX = /^(-?\d+\.\d+)$|^(-?\d+)$|null|undefined/;
    //const NUMBER_REGEX = /^(0|[1-9]\d*)?(\.\d+)?(?<=\d)$/;
    return NUMBER_REGEX.test(value?.toString());
  }

  // Ngày
  dateFormat(val: string | moment.Moment | Date) {
    // if (val == '0001-01-01T00:00:00' || val == '9999-12-31T23:59:59.9999999') return '';
    return val ? moment(val)?.format('DD/MM/YYYY') : '';
  }

  yearFormat(val: string | moment.Moment | Date) {
    return val ? moment(val).year() : '';
  }

  monthFormat(val: string | number) {
    return val ? moment(val).format('MM-YYYY') : '';
  }

  monthFormatTwo(val: string | number) {
    return val ? moment(val).format('MMM-YYYY') : '';
  }

  timeFormat(val: string | moment.Moment | Date) {
    return val ? moment(val).format('HH:mm') : '';
  }

  formatLongToMoment(serial: any) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);
    var fractional_day = serial - Math.floor(serial) + 0.0000001;
    var total_seconds = Math.floor(86400 * fractional_day);
    var seconds = total_seconds % 60;
    total_seconds -= seconds;
    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;
    let date = new Date(
      date_info.getFullYear(),
      date_info.getMonth(),
      date_info.getDate(),
      hours,
      minutes,
      seconds
    );
    return moment(date);
  }

  // Ngày giờ
  dateTimeFormat(val: any) {
    // if (val == '0001-01-01T00:00:00' || val == '9999-12-31T23:59:59.9999999') return '';
    return val ? moment(val)?.format('DD/MM/YYYY HH:mm') : '';
  }

  //check VIN
  vinNoValidate(vinNo: string) {
    const VINNO_NO_REGEX = /^([a-zA-Z0-9]{1,7}-\d{7}|[a-zA-Z0-9]{17})$/g;
    return VINNO_NO_REGEX.test(vinNo);
  }

  // Biển số xe
  registerNoValidate(registerNo: string) {
    const REGISTER_NO_REGEX = /^\d{2}\D{1}[-. ]?\d{4}[\d{1}]?$/g;
    return REGISTER_NO_REGEX.test(registerNo);
  }

  // Số điện thoại
  phoneNumberValidate(phoneNumber: string) {
    const PHONE_NUMBER_REGEX =
      /(0|[+]([0-9]{2})){1}[ ]?[0-9]{2}([-. ]?[0-9]){7}|((([0-9]{3}[- ]){2}[0-9]{4})|((0|[+][0-9]{2}[- ]?)(3|7|8|9|1)([0-9]{8}))|(^[\+]?[(][\+]??[0-9]{2}[)]?([- ]?[0-9]{2}){2}([- ]?[0-9]{3}){2}))$/gm;
    return !phoneNumber || PHONE_NUMBER_REGEX.test(phoneNumber);
  }

  // Validate Phone number
  phoneNumberCheckValidate(phoneNumber?: string) {
    const PHONE_NUMBER_VALIDATE =
      /(^\(?([0-9]{4})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3})$)|(^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$)|(^\(?([0-9]{3}|[0-9]{4})\)?([0-9]{3}|[0-9]{4})?([0-9]{3}|[0-9]{4})$)/gm;
    return (
      !phoneNumber ||
      (phoneNumber.length > 7 &&
        phoneNumber.length < 13 &&
        PHONE_NUMBER_VALIDATE.test(phoneNumber))
    );
  }
  // Mã màu
  colorValidate(color: string) {
    const COLOR_REGEX =
      /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^\)]*\)/gi;
    return COLOR_REGEX.test(color);
  }

  // Không được là số âm
  notNegativeNumberValidate(params: number | string) {
    return !(params !== '' && params && Number(params) < 0);
  }

  // Số nguyên dương
  positiveNumberValidate(params: string | number) {
    const NUMBER_REG =
      /^(?!(?:^[-+]?[0.]+(?:[Ee]|$)))(?!(?:^-))(?:(?:[+-]?)(?=[0123456789.])(?:(?:(?:[0123456789]+)(?:(?:[.])(?:[0123456789]*))?|(?:(?:[.])(?:[0123456789]+))))(?:(?:[Ee])(?:(?:[+-]?)(?:[0123456789]+))|))$/;
    //const NUMBER_REG = /^\d*[1-9]+\d*$/;
    // return !(params.value !== '' && ((params.value && Number(params.value) <= 0) || !NUMBER_REG.test(params.value)));
    return NUMBER_REG.test(params.toString());
  }

  // Số nguyên không âm
  notNegativeIntNumberValidate(params: any) {
    const NUMBER_REG = /^\d+$/g;
    return NUMBER_REG.test(params);
  }

  // Số nguyên
  intNumberValidate(params: string) {
    const NUMBER_REG = /^([+-]?[1-9]\d*|0)$/;
    return !(params !== '' && !NUMBER_REG.test(params));
  }

  emailValidate(email: string) {
    const NUMBER_REG = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    return NUMBER_REG.test(email);
  }

  /* For Sale */
  // Format input trong Cell Grid sang dạng DateTime để truyền xuống database
  formatInputToDateTime(input: string | Date) {
    const date = new Date(input);
    return date;
  }

  // format từ số giây sang giờ
  formatHoursSecond(seconds: number) {
    if (seconds && seconds > 0) {
      const hours =
        Math.floor(seconds / 3600) < 10
          ? `0${Math.floor(seconds / 3600)}`
          : Math.floor(seconds / 3600);
      const minutes =
        Math.floor((seconds % 3600) / 60) < 10
          ? `0${Math.floor((seconds % 3600) / 60)}`
          : Math.floor((seconds % 3600) / 60);
      // const second = seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60;
      return `${hours}:${minutes}`;
    } else if (seconds === 0) {
      return `00:00`;
    } else if (!seconds) {
      return '';
    } else return '';
  }

  //convert từ giờ nhập vào sang số giây
  convertTimeToSeconds(time: string): number {
    return time
      .split(':')
      .reverse()
      .reduce((prev, curr, i) => prev + +curr * Math.pow(60, i), 0);
  }

  //format Date for sale
  formatDateForSale(date: any) {
    const isFirefox = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
    if (date) {
      let convertDate;
      if (typeof date === 'string' && date.length === 1) {
        return date;
      }

      if (isFirefox && typeof date === 'string') {
        const dateArr = date.split('-');
        date = `${dateArr[1]} ${dateArr[0]}, ${dateArr[2]}`;
      }
      convertDate = new Date(date);
      const displayDate =
        convertDate.getDate() < 10
          ? `0${convertDate.getDate()}`
          : convertDate.getDate();
      const formattedMonth =
        convertDate.getMonth() < 9
          ? `0${convertDate.getMonth() + 1}`
          : convertDate.getMonth() + 1;
      const displayMonth = moment(formattedMonth, 'MM').format('MMM');

      return convertDate
        ? `${displayDate}-${displayMonth}-${convertDate.getFullYear()}`
        : '';
    }
    return '';
  }

  formatDisplayValue(val: any, hideDecimal?: boolean) {
    val = hideDecimal ? val : this.numberFormat(val);
    if (val) {
      if (typeof val === 'string') {
        let num = val.trim().replace(/,([0-9]{3})/g, '$1');
        if (!isNaN(parseFloat(num)))
          return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(parseFloat(num));
        else return '0.00';
      } else {
        const num = val.toString().replace(/,/g, '');
        return +num
          ? new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(+num)
          : val;
      }
    }
    return '';
  }

  formatMoney(val: number | string) {
    if (val) {
      if (typeof val === 'string') {
        let num = val.trim().replace(/\,([0-9]{3})/g, '$1');

        num = val.trim().replace(/\,/g, '');
        const NUMBER_REGEX = /^([0-9]*)$/g;
        if (NUMBER_REGEX.test(num)) {
          return parseFloat(num).toLocaleString('en-US');
        }
        return val;
      } else {
        const num = val.toString().replace(/\,/g, '');
        return parseFloat(num) ? parseFloat(num).toLocaleString('en-US') : val;
      }
    }
    return 0;
  }

  formatFloatQty(val: number | string) {
    if (val) {
      if (this.isFormatCurrency == '1') {
        if (typeof val === 'string') {
          let num = val.trim().replace(/\,([0-9]{3})/g, '$1');
          num = val.trim().replace(/\,/g, '');
          return parseFloat(num).toLocaleString();
        } else {
          const num = val.toString().replace(/\,/g, '');
          return parseFloat(num) ? parseFloat(num).toLocaleString() : val;
        }
      } else {
        if (typeof val === 'string') {
          let num = val.trim().replace(/\,([0-9]{3})/g, '$1');
          num = val.trim().replace(/\,/g, '');
          return parseFloat(num).toLocaleString('de-DE');
        } else {
          const num = val.toString().replace(/\,/g, '');
          return parseFloat(num)
            ? parseFloat(num).toLocaleString('de-DE')
            : val;
        }
      }
    } else {
      return '0';
    }
  }
}
