import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

const Home: React.FC = () => {
  return (
    <ThemedView>
      <ThemedView style={styles.container}>
        <Pressable>
          <Link href="/login">Home</Link>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
});

export default Home;
