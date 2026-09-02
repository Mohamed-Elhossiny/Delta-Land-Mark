import { Component } from '@angular/core';
import { HeroSection } from '../sections/hero-section/hero-section';
import { StatsSection } from '../sections/stats-section/stats-section';
import { FeaturesSection } from '../sections/features-section/features-section';
import { AboutSection } from '../sections/about-section/about-section';
import { CardsSection } from '../sections/cards-section/cards-section';
import { CategoriesSection } from '../sections/categories-section/categories-section';
import { ContactSection } from '../sections/contact-section/contact-section';

@Component({
  selector: 'app-home',
  imports: [
    HeroSection,
    StatsSection,
    FeaturesSection,
    AboutSection,
    CardsSection,
    CategoriesSection,
    ContactSection,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
