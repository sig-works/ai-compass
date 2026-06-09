export interface AffiliateLink {
  href: string;
  label: string;
  provider?: string;
  category?: string;
}

export const AFFILIATE_DISCLOSURE =
  'このサイトはアフィリエイト広告を利用する場合があります。';

export const AFFILIATE_POLICY_PATH = '/affiliate-policy/';

export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  'amazon-mx-keys-s': {
    href: 'https://amzn.to/3RWdDnC',
    label: 'Logicool MX Keys S',
    provider: 'Amazon',
    category: 'device'
  },
  'amazon-benq-ex240n': {
    href: 'https://www.amazon.co.jp/EX240N-%E3%82%B2%E3%83%BC%E3%83%9F%E3%83%B3%E3%82%B0%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC-treVolo%E3%82%B9%E3%83%94%E3%83%BC%E3%82%AB%E3%83%BC-eQualizer-%E8%BC%9D%E5%BA%A6%E8%87%AA%E5%8B%95%E8%AA%BF%E6%95%B4%E6%A9%9F%E8%83%BD%EF%BC%88B-I/dp/B0B68VMGFH?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&crid=3MKOXUD1GFJ05&dib=eyJ2IjoiMSJ9.4xXVziD15NOF2qhTHbBa9kGRGi_4lK-DLZnSW9awsGcT1QdSP6WAGnsVef_WJ8aBzkLSgnMrZYfnM1K3kFmJs-Ch-63S6qmCNewvDnujmGzLmrOmaknibWzjPhWtUx6Lle3Px10MwgIpTrO0toPL98murJtRCqrmFHiiqNlSdwEa7wO2tBYwUKsx7Tw55BJ2sqNgKQkoo6gkU1fV8QgYNsZJ7mmoibrN-BkrZ06cVelT1rcvUaZDljLGep044tHhnIlkXZeqs46A3cRaL6_N-Hgk3LCwArt6H5xfhSVFjls.vZClk6RsrjTgtenmOqRoTHGMriWRBkjQc-XgKh42eeA&dib_tag=se&keywords=benq&qid=1781011624&s=electronics&sprefix=benq%2Celectronics%2C269&sr=1-5&linkCode=ll2&tag=sig0845-22&linkId=c6005319801c1ba114edaaeb14c20e53&ref_=as_li_ss_tl',
    label: 'BenQ MOBIUZ EX240N',
    provider: 'Amazon',
    category: 'device'
  },
  'amazon-msi-g274qpf-e2': {
    href: 'https://www.amazon.co.jp/MSI-%E3%82%B2%E3%83%BC%E3%83%9F%E3%83%B3%E3%82%B0%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC-Adaptive-Sync-DisplayHDR-%E7%B8%A6%E6%A8%AA%E5%9B%9E%E8%BB%A2%E3%83%BB%E9%AB%98%E3%81%95%E8%AA%BF%E6%95%B4/dp/B0CVWZL4PN?pd_rd_w=n5fok&content-id=amzn1.sym.38131c0a-f2c6-4ac6-9dd9-528356f0c9da&pf_rd_p=38131c0a-f2c6-4ac6-9dd9-528356f0c9da&pf_rd_r=JG32E4655X6RKXR8DAW8&pd_rd_wg=IaS9n&pd_rd_r=4f86db88-bb7c-4c5e-82b7-ee5509c21edb&pd_rd_i=B0CVWZL4PN&th=1&linkCode=ll2&tag=sig0845-22&linkId=267701701bb282a00188681b52931a81&ref_=as_li_ss_tl',
    label: 'MSI G274QPF E2',
    provider: 'Amazon',
    category: 'device'
  },
  'amazon-ergotron-lx-arm': {
    href: 'https://www.amazon.co.jp/%E3%82%A8%E3%83%AB%E3%82%B4%E3%83%88%E3%83%AD%E3%83%B3-%E3%83%87%E3%82%B9%E3%82%AF%E3%83%9E%E3%82%A6%E3%83%B3%E3%83%88-%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC%E3%82%A2%E3%83%BC%E3%83%A0-%E3%83%9E%E3%83%83%E3%83%88%E3%83%96%E3%83%A9%E3%83%83%E3%82%AF-45-241-224/dp/B07Q8TJ2KL?crid=37D20JHJJ2FQ7&dib=eyJ2IjoiMSJ9.M0HkLPQKepxRLFvvPeOuGMfeYLvduQi_oJ3SAoacPAY9NVq2P5j2pklyVxaYfPyjjnXkQf1ZrkE4nRwXpOQN6bPIEJqKn_0W2dC5qEf2qepZ9eMVe750uP4S1KikSc0WRiS385QqCL1dOI1z1qarESIhi5D2cJi49E03MuF4gwvqpbon6bK0CVFhOFYls84HBwGHX3ekUcS4z3DeJ8pwWT-JRzCtwBsI-zzSAKAGhHxvqQXTzXeGn8DDIctA1pHfNh2YnxWdWrO37WLVLYG_SNiNOeK0LicCPBKg3lsoVe4.0fsRrl5m4xcv6exfg2oEmHTvkGXOOw5osL_QjwOWkSc&dib_tag=se&keywords=%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC%E3%82%A2%E3%83%BC%E3%83%A0&qid=1781012722&s=computers&sprefix=%E3%83%A2%E3%83%8B%E3%82%BF%2Ccomputers%2C211&sr=1-4&th=1&linkCode=ll2&tag=sig0845-22&linkId=60e1bb4d79a4648abe96017307de944d&ref_=as_li_ss_tl',
    label: 'Ergotron LX Desk Monitor Arm',
    provider: 'Amazon',
    category: 'device'
  },
  'amazon-ergo-m575sp': {
    href: 'https://www.amazon.co.jp/%25E3%2580%2590Amazon-co-jp%25E9%2599%2590%25E5%25AE%259A%25E3%2580%2591-%25E3%2583%25AD%25E3%2582%25B8%25E3%2582%25AF%25E3%2583%25BC%25E3%2583%25AB-%25E3%2583%2588%25E3%2583%25A9%25E3%2583%2583%25E3%2582%25AF%25E3%2583%259C%25E3%2583%25BC%25E3%2583%25AB%25E3%2583%259E%25E3%2582%25A6%25E3%2582%25B9-%25E2%2580%25BBAmazon-co-jp%25E9%2599%2590%25E5%25AE%259A-%25E5%25A3%2581%25E7%25B4%2599%25E3%2583%2580%25E3%2582%25A6%25E3%2583%25B3%25E3%2583%25AD%25E3%2583%25BC%25E3%2583%2589%25E4%25BB%2598%25E3%2581%258D/dp/B0DC5WQQ2J?th=1&linkCode=ll2&tag=sig0845-22&linkId=f22cb48de71e90335e4c69088cfdf220&ref_=as_li_ss_tl',
    label: 'Logicool ERGO M575SP',
    provider: 'Amazon',
    category: 'device'
  },
  'amazon-peripro-303': {
    href: 'https://www.amazon.co.jp/PERIPRO-303-mm%E4%BA%A4%E6%8F%9B%E7%94%A8%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%83%9C%E3%83%BC%E3%83%AB-PERIMICE-517-%E3%82%A8%E3%83%AC%E3%82%B3%E3%83%A0%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%83%9C%E3%83%BC%E3%83%AB%E3%83%9E%E3%82%A6%E3%82%B9%E3%81%A8%E4%BA%92%E6%8F%9B%E6%80%A7%E6%9C%89%E3%82%8A%E3%80%90Amazon-jp-%E9%99%90%E5%AE%9A%E5%95%86%E5%93%81%E3%80%91%E3%80%90%E6%AD%A3%E8%A6%8F%E4%BF%9D%E8%A8%BC%E5%93%81%E3%80%91/dp/B08DD6GQRV?crid=1NSUT9Z9Q4GQ0&dib=eyJ2IjoiMSJ9.rkzIBZHwG8ZTB6ff2QvvqbqnZ4N0uHo1UHxlc1qQ_gybkVBZ8_5WugwXcRT3TayWuyH0eea2w2_8Bd7JgQlr_8SKfQ2zQHd7nAKfMw4Zu9eduL5h9AA8zbFQgLpvyubcxDwvmQE3DIHXjNREdGPO5-p5uO8sfM1S93rbwqw5uqH0DofrtVUHalulYRJBR3r-wbh1KHWblNgBY2qYRdRVH9luxiRrqESDDP5azYcBMsb7iv4fkuQt3JjM81qubJ3QOK6WqCbPX4km59md3_5u5dSZMZWfOm8Q17-Vo4m8lto.ZDTwHk8Ria1qEY4oMX3Oqpu5rjkoCJaFb35eTVOfFdY&dib_tag=se&keywords=%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%83%9C%E3%83%BC%E3%83%AB%2B%E3%83%9A%E3%83%AA%E3%83%83%E3%82%AF%E3%82%B9%2B34mm&qid=1781009735&sprefix=%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%83%9C%E3%83%BC%E3%83%AB%2Bpe%2Caps%2C247&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.d8e7ee72-073f-4b97-8ec0-59c18d6dfebe&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=sig0845-22&linkId=94c5ec2aca1eee7684e5f26f6803fb62&ref_=as_li_ss_tl',
    label: 'PERIPRO-303 34mm 交換用トラックボール',
    provider: 'Amazon',
    category: 'device'
  }
};

export function affiliateUrl(id: string, fallbackUrl: string) {
  return AFFILIATE_LINKS[id]?.href ?? fallbackUrl;
}
