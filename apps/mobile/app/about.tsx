import { View, Text, ScrollView, Image, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Gem, Heart, Shield, Sparkles, Award, Clock } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

// Timeline data for company milestones
const timelineData = [
  {
    year: '1892',
    title: 'La Fondation',
    description:
      "Pierre-Auguste Bijoux fonde sa première boutique dans le quartier du Marais à Paris, établissant les fondations d'un héritage d'excellence.",
  },
  {
    year: '1925',
    title: "L'Âge d'Or",
    description:
      'La maison devient fournisseur officiel de la haute société parisienne, créant des pièces uniques pour les grandes familles européennes.',
  },
  {
    year: '1960',
    title: 'Innovation et Tradition',
    description:
      "Introduction de techniques avant-gardistes tout en préservant l'artisanat traditionnel. Ouverture de l'atelier de création.",
  },
  {
    year: '1985',
    title: 'Reconnaissance Internationale',
    description:
      'Expansion internationale avec des boutiques à Londres, New York et Tokyo. La marque devient synonyme de luxe français.',
  },
  {
    year: '2010',
    title: 'Développement Durable',
    description:
      "Engagement pionnier pour une joaillerie éthique avec des matériaux sourcés de manière responsable et une traçabilité complète.",
  },
  {
    year: "Aujourd'hui",
    title: 'Héritage et Modernité',
    description:
      "Cinq générations plus tard, notre maison continue d'allier tradition et innovation pour créer des pièces intemporelles.",
  },
];

// Craftsmanship values
const valuesData = [
  {
    icon: Gem,
    title: 'Excellence',
    description: 'Chaque création est le fruit de centaines d\'heures de travail minutieux par nos maîtres artisans.',
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'L\'amour du beau guide chacun de nos gestes, de la conception à la finition.',
  },
  {
    icon: Shield,
    title: 'Authenticité',
    description: 'Nous garantissons l\'origine et la qualité de chaque pierre et métal précieux.',
  },
  {
    icon: Sparkles,
    title: 'Innovation',
    description: 'Nous repoussons les limites de la joaillerie tout en respectant les techniques ancestrales.',
  },
];

// Premium materials
const materialsData = [
  {
    name: 'Or 18 Carats',
    description: 'Issu de filières certifiées responsables, notre or est raffiné selon les plus hauts standards.',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&q=80',
  },
  {
    name: 'Diamants',
    description: 'Sélectionnés selon les critères les plus stricts des 4C, nos diamants sont certifiés GIA.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
  },
  {
    name: 'Pierres Précieuses',
    description: 'Rubis, saphirs et émeraudes sourcés directement des mines les plus réputées.',
    image: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=400&q=80',
  },
  {
    name: 'Platine',
    description: 'Le métal le plus pur et le plus rare, symbole d\'élégance éternelle.',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80',
  },
];

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
  isLast?: boolean;
}

function TimelineItem({ year, title, description, isLast = false }: TimelineItemProps) {
  return (
    <View className="flex-row">
      {/* Timeline line and dot */}
      <View className="items-center mr-4">
        <View className="w-3 h-3 rounded-full bg-hermes-500" />
        {!isLast && <View className="w-0.5 flex-1 bg-hermes-200" />}
      </View>
      {/* Content */}
      <View className="flex-1 pb-8">
        <Text className="font-sans text-xs text-hermes-500 uppercase tracking-wider mb-1">
          {year}
        </Text>
        <Text className="font-serif text-lg text-text-primary mb-2">{title}</Text>
        <Text className="font-sans text-sm text-text-muted leading-relaxed">{description}</Text>
      </View>
    </View>
  );
}

interface ValueCardProps {
  icon: typeof Gem;
  title: string;
  description: string;
}

function ValueCard({ icon: Icon, title, description }: ValueCardProps) {
  return (
    <View className="bg-white rounded-elegant p-5 shadow-sm border border-border-light">
      <View className="w-12 h-12 rounded-full bg-hermes-50 items-center justify-center mb-4">
        <Icon size={24} color="#f67828" />
      </View>
      <Text className="font-serif text-lg text-text-primary mb-2">{title}</Text>
      <Text className="font-sans text-sm text-text-muted leading-relaxed">{description}</Text>
    </View>
  );
}

interface MaterialCardProps {
  name: string;
  description: string;
  image: string;
}

function MaterialCard({ name, description, image }: MaterialCardProps) {
  return (
    <View className="bg-white rounded-elegant overflow-hidden shadow-sm border border-border-light mb-4">
      <Image
        source={{ uri: image }}
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="font-serif text-lg text-text-primary mb-2">{name}</Text>
        <Text className="font-sans text-sm text-text-muted leading-relaxed">{description}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Notre Histoire',
          headerBackTitle: 'Retour',
          headerStyle: { backgroundColor: '#fffcf7' },
          headerTintColor: '#2b333f',
          headerTitleStyle: {
            fontFamily: 'PlayfairDisplay-Medium',
          },
        }}
      />
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="relative">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80',
            }}
            style={{ width: screenWidth, height: screenWidth * 0.75 }}
            resizeMode="cover"
            className="bg-background-beige"
          />
          <View className="absolute inset-0 bg-black/40 items-center justify-center px-8">
            <Text className="font-serif text-4xl text-white text-center mb-3">
              Notre Histoire
            </Text>
            <View className="w-16 h-0.5 bg-hermes-500 mb-4" />
            <Text className="font-sans text-white/90 text-center text-base leading-relaxed">
              Plus d'un siècle d'excellence dans l'art de la joaillerie
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <View className="px-6 py-10">
          <Text className="font-display text-3xl text-text-primary text-center leading-relaxed mb-6">
            "L'élégance est la seule beauté qui ne se fane jamais"
          </Text>
          <Text className="font-sans text-text-muted text-center text-sm italic mb-8">
            - Audrey Hepburn
          </Text>
          <Text className="font-sans text-text-secondary text-center leading-relaxed">
            Depuis 1892, notre maison perpétue l'art ancestral de la joaillerie française.
            Chaque création est le témoignage de notre engagement envers l'excellence,
            l'authenticité et le raffinement.
          </Text>
        </View>

        {/* Founder Section */}
        <View className="bg-background-beige px-6 py-10">
          <View className="flex-row items-start">
            <View className="w-24 h-24 rounded-full bg-text-primary/10 items-center justify-center mr-4">
              <Award size={40} color="#2b333f" />
            </View>
            <View className="flex-1">
              <Text className="font-sans text-xs text-hermes-500 uppercase tracking-wider mb-1">
                Fondateur
              </Text>
              <Text className="font-serif text-xl text-text-primary mb-2">
                Pierre-Auguste Bijoux
              </Text>
              <Text className="font-sans text-sm text-text-muted leading-relaxed">
                Visionnaire et artisan d'exception, il a posé les fondations d'un héritage
                qui traverse les générations.
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline Section */}
        <View className="px-6 py-10">
          <View className="items-center mb-8">
            <Clock size={32} color="#f67828" />
            <Text className="font-serif text-2xl text-text-primary text-center mt-4 mb-2">
              Notre Parcours
            </Text>
            <Text className="font-sans text-text-muted text-center text-sm">
              Plus d'un siècle d'histoire et de passion
            </Text>
          </View>

          <View className="mt-6">
            {timelineData.map((item, index) => (
              <TimelineItem
                key={item.year}
                year={item.year}
                title={item.title}
                description={item.description}
                isLast={index === timelineData.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Craftsmanship Values */}
        <View className="bg-background-beige px-6 py-10">
          <View className="items-center mb-8">
            <Text className="font-serif text-2xl text-text-primary text-center mb-2">
              Nos Valeurs
            </Text>
            <View className="w-12 h-0.5 bg-hermes-500 mb-4" />
            <Text className="font-sans text-text-muted text-center text-sm">
              Les piliers de notre savoir-faire
            </Text>
          </View>

          <View className="space-y-4">
            {valuesData.map((value, index) => (
              <View key={value.title} className="mb-4">
                <ValueCard
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Premium Materials */}
        <View className="px-6 py-10">
          <View className="items-center mb-8">
            <Gem size={32} color="#f67828" />
            <Text className="font-serif text-2xl text-text-primary text-center mt-4 mb-2">
              Nos Matériaux
            </Text>
            <Text className="font-sans text-text-muted text-center text-sm">
              Sélectionnés avec la plus grande exigence
            </Text>
          </View>

          {materialsData.map((material) => (
            <MaterialCard
              key={material.name}
              name={material.name}
              description={material.description}
              image={material.image}
            />
          ))}
        </View>

        {/* Certification Badge */}
        <View className="mx-6 mb-10 bg-text-primary rounded-elegant p-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-hermes-500 items-center justify-center">
              <Shield size={28} color="white" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="font-serif text-lg text-white mb-1">
                Certifié Joaillerie Responsable
              </Text>
              <Text className="font-sans text-sm text-white/70 leading-relaxed">
                Membre du Responsible Jewellery Council depuis 2010
              </Text>
            </View>
          </View>
        </View>

        {/* Closing Statement */}
        <View className="bg-background-beige px-6 py-12">
          <Text className="font-display text-2xl text-text-primary text-center leading-relaxed mb-6">
            "Chaque bijou raconte une histoire. Laissez-nous écrire la vôtre."
          </Text>
          <View className="items-center">
            <Text className="font-serif text-lg text-hermes-500">Maison Bijoux</Text>
            <Text className="font-sans text-xs text-text-muted mt-1 uppercase tracking-widest">
              Depuis 1892
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </>
  );
}
