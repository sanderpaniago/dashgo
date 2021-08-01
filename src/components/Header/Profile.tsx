import { Avatar, Box, Flex, Text } from "@chakra-ui/react";

interface ProfileProps {
    showProfileDate?: boolean;
}

export function Profile({ showProfileDate = true }: ProfileProps) {
    return (
        <Flex align='center'>
            {showProfileDate && (
                <Box mr='4' textAlign='right'>
                    <Text>Sander Paniago</Text>
                    <Text color='gray.300' fontSize='small'>
                        sanderppaniago@gmail.com
                    </Text>
                </Box>
            )}
            <Avatar size='md' name='Sander Paniago' src='https://github.com/sanderpaniago.png' />
        </Flex>
    )
}