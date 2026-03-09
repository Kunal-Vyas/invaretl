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
    version.set("20.11.1")
    npmVersion.set("10.2.4")
    download.set(true)
    nodeProjectDir.set(file("${project.projectDir}/ui"))
}

// Use 'npm ci' instead of 'npm install' to guarantee a reproducible build:
//   - Installs exact versions from package-lock.json (no implicit upgrades)
//   - Fails fast if package.json and package-lock.json are out of sync
//   - Matches what the Dockerfile and CI pipeline both use
val npmCi = tasks.register<com.github.node_gradle.node.npm.task.NpmTask>("npmCi") {
    args.set(listOf("ci"))
    inputs.file(file("${project.projectDir}/ui/package-lock.json"))
    inputs.file(file("${project.projectDir}/ui/package.json"))
    outputs.dir(file("${project.projectDir}/ui/node_modules"))
    // Only re-run when package-lock.json or package.json actually change
    outputs.upToDateWhen {
        file("${project.projectDir}/ui/node_modules").exists()
    }
}

val npmBuild = tasks.register<com.github.node_gradle.node.npm.task.NpmTask>("npmBuild") {
    dependsOn(npmCi)
    args.set(listOf("run", "build"))
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
    tasks.named("processResources") {
        dependsOn(copyUiToStatic)
    }
}
