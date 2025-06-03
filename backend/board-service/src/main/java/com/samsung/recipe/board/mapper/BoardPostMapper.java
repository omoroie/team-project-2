package com.samsung.recipe.board.mapper;

import com.samsung.recipe.board.dto.BoardPostRequestDto;
import com.samsung.recipe.board.dto.BoardPostResponseDto;
import com.samsung.recipe.board.entity.BoardPost;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class BoardPostMapper {
    
    @Autowired
    private ModelMapper modelMapper;
    
    public BoardPost toEntity(BoardPostRequestDto boardPostRequestDto) {
        return modelMapper.map(boardPostRequestDto, BoardPost.class);
    }
    
    public BoardPostResponseDto toResponseDto(BoardPost boardPost) {
        return modelMapper.map(boardPost, BoardPostResponseDto.class);
    }
}