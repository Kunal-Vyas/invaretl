buildscript {
    repositories {
        maven { url = uri("https://plugins.gradle.org/m2/") }
        mavenCentral()
    }
    dependencies {
        classpath("com.github.node-gradle:gradle-node-plugin:7.0.2")
    }
}

plugins {
    id("java")
    id("com.github.node-gradle.node") version "7.0.2"
}

allprojects {
    group = "com.invartek"
    version = "0.0.1-SNAPSHOT"

    repositories {
        maven { url = uri("https://plugins.gradle.org/m2/") }
        mavenCentral()
    }
}

node {
    version.set("20.19.0")
    npmVersion.set("10.8.2")
    download.set(true)
    nodeProjectDir.set(file("${project.projectDir}/ui"))
}

// Use 'npm ci' instead of 'npm install' to guarantee a reproducible build:
//   - Installs exact versions from package-lock.json (no implicit upgrades)
//   - Fails fast if package.json and package-lock.json are out of sync
//   - Matches what the Dockerfile and CI pipeline both use
val npmTaskClass = Class.forName("com.github.gradle.node.npm.task.NpmTask")

@Suppress("UNCHECKED_CAST")
val npmCi = tasks.register("npmCi", npmTaskClass as Class<org.gradle.api.Task>) {
    val argsProperty = this::class.java.getMethod("getArgs")
    @Suppress("UNCHECKED_CAST")
    val argsListProp = argsProperty.invoke(this) as org.gradle.api.provider.ListProperty<String>
    argsListProp.set(listOf("ci"))
    inputs.file(file("${project.projectDir}/ui/package-lock.json"))
    inputs.file(file("${project.projectDir}/ui/package.json"))
    outputs.dir(file("${project.projectDir}/ui/node_modules"))
    outputs.upToDateWhen {
        file("${project.projectDir}/ui/node_modules").exists()
    }
}

@Suppress("UNCHECKED_CAST")
val npmBuild = tasks.register("npmBuild", npmTaskClass as Class<org.gradle.api.Task>) {
    dependsOn(npmCi)
    val argsProperty = this::class.java.getMethod("getArgs")
    @Suppress("UNCHECKED_CAST")
    val argsListProp = argsProperty.invoke(this) as org.gradle.api.provider.ListProperty<String>
    argsListProp.set(listOf("run", "build"))
    inputs.dir(file("${project.projectDir}/ui/src"))
    inputs.file(file("${project.projectDir}/ui/package.json"))
    inputs.file(file("${project.projectDir}/ui/vite.config.ts"))
    inputs.file(file("${project.projectDir}/ui/tsconfig.app.json"))
    outputs.dir(file("${project.projectDir}/ui/dist"))
}

val copyUiToStatic = tasks.register<Copy>("copyUiToStatic") {
    dependsOn(npmBuild)
    from("${project.projectDir}/ui/dist")
    into("${project.projectDir}/server/src/main/resources/static")
}

project(":server") {
    afterEvaluate {
        tasks.named("processResources") {
            dependsOn(copyUiToStatic)
        }
    }
}
