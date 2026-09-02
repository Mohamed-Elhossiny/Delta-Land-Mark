import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
  stagger,
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0, transform: 'translateY(1.25rem)' })], { optional: true }),
    query(
      ':leave',
      [style({ opacity: 1, transform: 'translateY(0)' }), animate('280ms ease-out', style({ opacity: 0, transform: 'translateY(-0.75rem)' }))],
      { optional: true }
    ),
    query(
      ':enter',
      [animate('420ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))],
      { optional: true }
    ),
  ]),
]);

export const heroEnter = trigger('heroEnter', [
  transition(':enter', [
    query(
      '.hero__eyebrow',
      [
        style({ opacity: 0, transform: 'translateY(1.25rem)' }),
        animate('620ms 180ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ],
      { optional: true }
    ),
    query(
      '.hero__title',
      [
        style({ opacity: 0, transform: 'translateY(1.5rem)' }),
        animate('720ms 320ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ],
      { optional: true }
    ),
    query(
      '.hero__actions',
      [
        style({ opacity: 0, transform: 'translateY(1rem)' }),
        animate('620ms 520ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ],
      { optional: true }
    ),
  ]),
]);

export const staggerList = trigger('staggerList', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(1rem)' }),
        stagger(80, [animate('500ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))]),
      ],
      { optional: true }
    ),
  ]),
]);

export const menuPanel = trigger('menuPanel', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-1.5%)' }),
    animate('500ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate('350ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 0, transform: 'translateY(-1%)' })),
  ]),
]);
