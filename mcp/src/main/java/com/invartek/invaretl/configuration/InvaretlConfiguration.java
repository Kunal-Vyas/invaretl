package com.invartek.invaretl.configuration;

import com.invartek.invaretl.mcp.tools.CalculatorTools;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 *
 * @author kunal
 */
@Configuration
public class InvaretlConfiguration {

    @Bean
    public ToolCallbackProvider referralTools(CalculatorTools calculatorTools) {
        return MethodToolCallbackProvider
            .builder()
            .toolObjects(calculatorTools)
            .build();
    }

}
