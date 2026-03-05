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

val npmBuild = tasks.register<com.github.node_gradle.node.npm.task.NpmTask>("npmBuild") {
    dependsOn("npmInstall")
    args.set(listOf("run", "build"))
    inputs.dir(file("${project.projectDir}/ui/src"))
    inputs.file(file("${project.projectDir}/ui/package.json"))
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
