import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { Link } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import type { Product } from '@bijoux/types';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { api } from '@/lib/api';
import { useCategories } from '@/context/CategoryContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 90; // Height of bottom tab bar
const HERO_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1585960622850-ed33c41d6418?w=1200&q=85&auto=format&fit=crop';
const ABOUT_IMAGE_URL =
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Scroll Indicator Component with bouncing animation
function ScrollIndicator() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(12, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle} className="items-center">
      <ChevronDown size={28} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
    </Animated.View>
  );
}

// Animated CTA Button Component
function CTAButton({
  title,
  variant = 'filled',
  href,
  delay = 0,
}: {
  title: string;
  variant?: 'filled' | 'outline';
  href: string;
  delay?: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const isFilled = variant === 'filled';

  return (
    <Link href={href as never} asChild>
      <AnimatedPressable
        style={animatedStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`px-8 py-4 rounded-full ${
          isFilled
            ? 'bg-hermes-500'
            : 'bg-transparent border border-white/60'
        }`}
      >
        <Animated.View entering={FadeInDown.delay(delay).duration(600)}>
          <Text
            className={`font-sans font-semibold text-base tracking-wider ${
              isFilled ? 'text-white' : 'text-white'
            }`}
          >
            {title}
          </Text>
        </Animated.View>
      </AnimatedPressable>
    </Link>
  );
}

// Stat Item Component
function StatItem({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      className="items-center"
    >
      <Text className="font-serif text-3xl text-hermes-500">{value}</Text>
      <Text className="font-sans text-xs text-text-muted uppercase tracking-widest mt-1">
        {label}
      </Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { categories, refetch: refetchCategories, getCategoryIndex } = useCategories();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToContent = () => {
    scrollViewRef.current?.scrollTo({ y: HERO_HEIGHT, animated: true });
  };

  const fetchProducts = async () => {
    try {
      const productsData = await api.getFeaturedProducts();
      setFeaturedProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), refetchCategories()]);
    setRefreshing(false);
  }, [refetchCategories]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f67828" />
        }
      >
        {/* ============================================ */}
        {/* HERO SECTION - Full Screen minus tab bar */}
        {/* ============================================ */}
        <View style={{ height: HERO_HEIGHT }}>
          {/* Background Image */}
          <Image
            source={{ uri: HERO_IMAGE_URL }}
            style={{
              position: 'absolute',
              width: SCREEN_WIDTH,
              height: HERO_HEIGHT,
            }}
            resizeMode="cover"
          />

          {/* Dark Gradient Overlay - pointerEvents none to allow button touches */}
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.5)',
              'rgba(0,0,0,0.2)',
              'rgba(0,0,0,0.35)',
              'rgba(0,0,0,0.6)',
            ]}
            locations={[0, 0.3, 0.6, 1]}
            style={{
              position: 'absolute',
              width: SCREEN_WIDTH,
              height: HERO_HEIGHT,
            }}
            pointerEvents="none"
          />

          {/* Gold/Orange Accent Gradient at Bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(246,120,40,0.15)', 'rgba(246,120,40,0.25)']}
            locations={[0.7, 0.9, 1]}
            style={{
              position: 'absolute',
              width: SCREEN_WIDTH,
              height: HERO_HEIGHT,
            }}
            pointerEvents="none"
          />

          {/* Hero Content */}
          <View className="flex-1 justify-center items-center px-8" style={{ zIndex: 10 }}>
            {/* Decorative Top Line */}
            <Animated.View
              entering={FadeIn.delay(200).duration(800)}
              className="w-12 h-[1px] bg-hermes-500/60 mb-8"
            />

            {/* Main Title */}
            <Animated.Text
              entering={FadeInDown.delay(400).duration(800).springify()}
              className="font-serif text-5xl text-white text-center tracking-tight"
              style={{ lineHeight: 56 }}
            >
              L'Art de la{'\n'}Joaillerie
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
              entering={FadeInDown.delay(600).duration(800).springify()}
              className="font-sans text-lg text-white/80 text-center mt-6 tracking-wide"
              style={{ fontStyle: 'italic' }}
            >
              Pièces uniques. Élégance éternelle.
            </Animated.Text>

            {/* Decorative Orange Line */}
            <Animated.View
              entering={FadeIn.delay(800).duration(600)}
              className="w-20 h-[2px] bg-hermes-500 mt-8 mb-10"
            />

            {/* CTA Buttons */}
            <Animated.View
              entering={FadeInDown.delay(1000).duration(600)}
              className="flex-row gap-4"
            >
              <CTAButton title="Découvrir" variant="filled" href="/collections" delay={1100} />
              <CTAButton title="Collections" variant="outline" href="/collections" delay={1200} />
            </Animated.View>
          </View>

          {/* Scroll Indicator at Bottom - Tappable to scroll down */}
          <Pressable
            onPress={scrollToContent}
            className="absolute bottom-8 left-0 right-0 items-center"
            style={{ zIndex: 20 }}
          >
            <Animated.View entering={FadeIn.delay(1400).duration(600)} className="items-center py-4">
              <Text className="font-sans text-xs text-white/50 uppercase tracking-[3px] mb-2">
                Défiler
              </Text>
              <ScrollIndicator />
            </Animated.View>
          </Pressable>
        </View>

        {/* ============================================ */}
        {/* CATEGORIES SHOWCASE SECTION */}
        {/* ============================================ */}
        <View className="py-16 bg-background">
          {/* Section Header */}
          <View className="px-6 mb-8">
            <Animated.Text
              entering={FadeInDown.delay(100).duration(600)}
              className="font-sans text-xs text-hermes-500 uppercase tracking-[4px] mb-2"
            >
              Collections
            </Animated.Text>
            <View className="flex-row items-center justify-between">
              <Animated.Text
                entering={FadeInDown.delay(200).duration(600)}
                className="font-serif text-3xl text-text-primary"
              >
                Nos Univers
              </Animated.Text>
              <Link href="/collections" asChild>
                <Pressable className="flex-row items-center">
                  <Text className="font-sans text-sm text-hermes-500 mr-1">Voir tout</Text>
                  <ChevronRight size={16} color="#f67828" />
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Horizontal Scrolling Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {categories.slice(0, 5).map((category, index) => (
              <Animated.View
                key={category.id}
                entering={FadeInDown.delay(300 + index * 100).duration(600)}
                className="px-2"
                style={{ width: 280 }}
              >
                <CategoryCard category={category} index={getCategoryIndex(category.id) - 1} />
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* ============================================ */}
        {/* FEATURED PRODUCTS SECTION */}
        {/* ============================================ */}
        <View className="py-16 bg-background-beige">
          {/* Section Header */}
          <View className="px-6 mb-8">
            <Animated.Text
              entering={FadeInDown.delay(100).duration(600)}
              className="font-sans text-xs text-hermes-500 uppercase tracking-[4px] mb-2"
            >
              Sélection Exclusive
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(200).duration(600)}
              className="font-serif text-3xl text-text-primary"
            >
              Pièces d'Exception
            </Animated.Text>
          </View>

          {/* Products Grid - 2 Columns */}
          <View className="px-6">
            <View className="flex-row flex-wrap -mx-2">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <Animated.View
                  key={product.id}
                  entering={FadeInDown.delay(300 + index * 100).duration(600)}
                  className="w-1/2 px-2 mb-4"
                >
                  <ProductCard product={product} />
                </Animated.View>
              ))}
            </View>
          </View>

          {/* View All Button */}
          <Animated.View
            entering={FadeIn.delay(700).duration(600)}
            className="px-6 mt-4"
          >
            <Link href="/collections" asChild>
              <Pressable className="flex-row items-center justify-center py-4 border border-hermes-500/30 rounded-full">
                <Text className="font-sans text-hermes-500 font-medium mr-2">
                  Voir toutes les créations
                </Text>
                <ArrowRight size={18} color="#f67828" />
              </Pressable>
            </Link>
          </Animated.View>
        </View>

        {/* ============================================ */}
        {/* ABOUT / ARTISANAT SECTION */}
        {/* ============================================ */}
        <View className="py-16 bg-background">
          <View className="px-6">
            {/* Image */}
            <Animated.View
              entering={FadeIn.delay(200).duration(800)}
              className="mb-8 rounded-elegant overflow-hidden"
              style={{ height: 300 }}
            >
              <Image
                source={{ uri: ABOUT_IMAGE_URL }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {/* Subtle gradient overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                }}
              />
            </Animated.View>

            {/* Content */}
            <Animated.Text
              entering={FadeInDown.delay(300).duration(600)}
              className="font-sans text-xs text-hermes-500 uppercase tracking-[4px] mb-2"
            >
              Notre Savoir-Faire
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(400).duration(600)}
              className="font-serif text-3xl text-text-primary mb-4"
            >
              L'Excellence Artisanale
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(500).duration(600)}
              className="font-sans text-text-muted leading-relaxed mb-8"
            >
              Depuis des générations, notre maison perpétue la tradition d'excellence de la
              joaillerie française. Chaque pièce est créée avec passion, précision et un
              savoir-faire transmis de maître en apprenti.
            </Animated.Text>

            {/* Stats Row */}
            <View className="flex-row justify-around py-8 border-t border-b border-border-light mb-8">
              <StatItem value="35+" label="Années" delay={600} />
              <StatItem value="500+" label="Créations" delay={700} />
              <StatItem value="100%" label="Artisanal" delay={800} />
            </View>

            {/* CTA Button */}
            <Animated.View entering={FadeIn.delay(900).duration(600)}>
              <Link href="/about" asChild>
                <Pressable className="flex-row items-center justify-center py-4 bg-luxe-charcoal rounded-full">
                  <Text className="font-sans text-white font-medium mr-2">
                    Découvrir notre histoire
                  </Text>
                  <ArrowRight size={18} color="#fff" />
                </Pressable>
              </Link>
            </Animated.View>
          </View>
        </View>

        {/* ============================================ */}
        {/* NEWSLETTER SECTION */}
        {/* ============================================ */}
        <View className="py-16 bg-luxe-charcoal">
          <View className="px-6">
            {/* Decorative Line */}
            <Animated.View
              entering={FadeIn.delay(200).duration(600)}
              className="w-12 h-[1px] bg-hermes-500 mb-6 self-center"
            />

            {/* Title */}
            <Animated.Text
              entering={FadeInDown.delay(300).duration(600)}
              className="font-serif text-3xl text-luxe-cream text-center mb-3"
            >
              Restez Inspiré
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
              entering={FadeInDown.delay(400).duration(600)}
              className="font-sans text-luxe-taupe text-center mb-8 px-4"
            >
              Inscrivez-vous pour recevoir nos dernières créations et offres exclusives
              en avant-première.
            </Animated.Text>

            {/* Email Input */}
            <Animated.View
              entering={FadeInDown.delay(500).duration(600)}
              className="mb-4"
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Votre adresse email"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white/10 border border-white/20 rounded-full px-6 py-4 font-sans text-white"
              />
            </Animated.View>

            {/* Subscribe Button */}
            <Animated.View entering={FadeIn.delay(600).duration(600)}>
              <Pressable className="bg-hermes-500 py-4 rounded-full">
                <Text className="font-sans text-white font-semibold text-center tracking-wider">
                  S'inscrire à la newsletter
                </Text>
              </Pressable>
            </Animated.View>

            {/* Privacy Note */}
            <Animated.Text
              entering={FadeIn.delay(700).duration(600)}
              className="font-sans text-xs text-luxe-taupe/60 text-center mt-4"
            >
              En vous inscrivant, vous acceptez notre politique de confidentialité.
            </Animated.Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8 bg-background" />
      </ScrollView>
    </View>
  );
}
