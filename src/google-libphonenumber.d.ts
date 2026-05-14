declare module 'google-libphonenumber' {
    export class PhoneNumberUtil {
      static getInstance(): PhoneNumberUtil;
      parse(phoneNumber: string, region: string): PhoneNumber;
      isValidNumber(phoneNumber: PhoneNumber): boolean;
      format(phoneNumber: PhoneNumber, format: PhoneNumberFormat): string;
      getCountryCodeForRegion(region: string): number;
      getRegionCodeForNumber(phoneNumber: PhoneNumber): string;
      getSupportedRegions(): string[];
      getExampleNumberForType(region: string, type: string): PhoneNumber;
    }

    export class PhoneNumber {
      getNationalNumber(): string;
      getCountryCode(): number;
      getItalianLeadingZero(): boolean;
      getNumberType(): PhoneNumberType;
    }

    export enum PhoneNumberFormat {
      E164,
      INTERNATIONAL,
      NATIONAL,
      RFC3966
    }

    export enum PhoneNumberType {
      FIXED_LINE,
      MOBILE,
      FIXED_LINE_OR_MOBILE,
      TOLL_FREE,
      PREMIUM_RATE,
      SHARED_COST,
      VOIP,
      PERSONAL_NUMBER,
      PAGER,
      UAN,
      VOICEMAIL,
      UNKNOWN
    }
  }