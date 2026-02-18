package com.invartek.invaretl.mcp.tools;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

@Service
public class CalculatorTools {

    @Tool(name = "add", description = "Add two numbers")
    public double add(
        @ToolParam(
            description = "First number",
            required = true
        ) final double a,
        @ToolParam(
            description = "Second number",
            required = true
        ) final double b
    ) {
        return a + b;
    }

    @Tool(name = "subtract", description = "Subtract two numbers")
    public double subtract(
        @ToolParam(
            description = "First number",
            required = true
        ) final double a,
        @ToolParam(
            description = "Second number",
            required = true
        ) final double b
    ) {
        return a - b;
    }

    @Tool(name = "multiply", description = "Multiply two numbers")
    public double multiply(
        @ToolParam(
            description = "First number",
            required = true
        ) final double a,
        @ToolParam(
            description = "Second number",
            required = true
        ) final double b
    ) {
        return a * b;
    }

    @Tool(name = "divide", description = "Divide two numbers")
    public double divide(
        @ToolParam(
            description = "Dividend",
            required = true
        ) final double dividend,
        @ToolParam(
            description = "Divisor",
            required = true
        ) final double divisor
    ) {
        if (divisor == 0) {
            throw new IllegalArgumentException("Division by zero");
        }
        return dividend / divisor;
    }
}
