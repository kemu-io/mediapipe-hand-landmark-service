import styled from '@emotion/styled';
import { Icon } from '@mui/material';

const CustomSvg = styled(Icon)<{ fill?: string, topMargin?: number }>`
  svg {
    fill: ${(props) => props.fill || 'currentColor'};
    padding-top: ${(props) => props.topMargin || 0}px;
    ${(props) => props.css}
  }
`;

export default CustomSvg;
